import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { UpdateAccountTypeDto } from './dto/update-account-type.dto';
import { UpdateUserStatusDto } from './dto/update-status.dto';
import { MailService } from 'src/shared/mail/mail.service';
import * as bcrypt from 'bcrypt';
import { UpdateEmailDto } from './dto/update-user-email.dto';
import { JwtService } from '@nestjs/jwt';

type JWTPayload = {
  sub: string;
  userType: string;
  role: string;
  email: string;
};

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
  ) {}

  async findAll(
    filter: UserFilterDto,
  ): Promise<{ success: boolean; data: User[]; count: number }> {
    const {
      search,
      status,
      account_type,
      provider,
      limit,
      page,
      sort_by,
      sort_order,
    } = filter;
    const skip = ((page ?? 1) - 1) * (limit ?? 10);

    let where: FindOptionsWhere<User> | FindOptionsWhere<User>[] = {};

    if (status || account_type || provider) {
      where = {
        ...(status && { status: status as 'pending' | 'active' | 'inactive' }),
        ...(account_type && { account_type }),
        ...(provider && { provider }),
      };
    }

    if (search) {
      where = [
        { first_name: ILike(`%${search}%`), ...(where as object) },
        { last_name: ILike(`%${search}%`), ...(where as object) },
        { email: ILike(`%${search}%`), ...(where as object) },
      ];
    }

    const [data, count] = await this.userRepository.findAndCount({
      where,
      order: sort_by ? { [sort_by]: sort_order } : undefined,
      skip,
      take: limit,
      relations: ['profile', 'quotes', 'tickets', 'visits'],
    });

    data.forEach((user) => {
      user['profile_id'] = user.profile?.profile_id ?? null;
      user['quotes_count'] = user.quotes ? user.quotes.length : 0;
      user['tickets_count'] = user.tickets ? user.tickets.length : 0;
      user['visits_count'] = user.visits ? user.visits.length : 0;
    });

    return { success: true, data, count };
  }

  async findOne(id: string): Promise<{ success: boolean; data: User }> {
    const user = await this.userRepository.findOne({
      where: { user_id: id },
      relations: ['profile', 'quotes', 'tickets', 'visits'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return { success: true, data: user };
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { email },
      relations: ['profile', 'quotes', 'tickets', 'visits'],
    });
  }
  async create(
    createUserDto: CreateUserDto,
  ): Promise<{ success: boolean; data: User }> {
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email is already in use');
    }

    const user = this.userRepository.create(createUserDto);

    if (!user.provider) {
      user.provider = 'email';
    }
    if (user.provider !== 'email') {
      user.email_verified = true;
      user.status = 'active';
    } else {
      user.status = 'inactive';
      user.email_verified = false;

      const verificationCode = this.generateSecureOtp();
      const hashedVerificationToken = await bcrypt.hash(verificationCode, 12);

      user.hashed_email_verification_token = hashedVerificationToken;
      await this.sendOtpEmail(
        user.email,
        verificationCode,
        hashedVerificationToken,
        'email-verification',
      );
    }

    const savedUser = await this.userRepository.save(user);
    delete savedUser.hashed_email_verification_token;
    delete savedUser.hashed_refresh_token;
    delete savedUser.email_verification_expiry;
    delete savedUser.password;

    return { success: true, data: savedUser };
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<{ success: boolean; data: User }> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Prevent changing provider type
    if (
      updateUserDto.provider &&
      updateUserDto.provider !== user.data.provider
    ) {
      throw new BadRequestException('Cannot change authentication provider');
    }

    if (updateUserDto.password && user.data.password) {
      throw new BadRequestException(
        'Password update is not allowed for users who already have a password. Please log in and change your password or request a password reset.',
      );
    }

    const updated = this.userRepository.merge(user.data, updateUserDto);
    const savedUser = await this.userRepository.save(updated);
    return { success: true, data: savedUser };
  }

  async updateAccountType(
    updateAccountTypeDto: UpdateAccountTypeDto,
  ): Promise<{ success: boolean; data: User }> {
    const { userId, accountType } = updateAccountTypeDto;
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    user.account_type = accountType;
    const updatedUser = await this.userRepository.save(user);

    return { success: true, data: updatedUser };
  }

  async updateEmail(
    userId: string,
    updateEmailDto: UpdateEmailDto,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOneBy({ user_id: userId });

    if (!user) {
      throw new NotFoundException(`User with id ${userId} not found`);
    }

    // Prevent email changes for social users
    if (user.provider !== 'email') {
      throw new BadRequestException(
        'Email update not available for social users',
      );
    }

    if (user.email === updateEmailDto.email) {
      throw new BadRequestException(
        'New email must be different from current email',
      );
    }

    const verificationCode = this.generateSecureOtp();
    const hashedVerificationToken = await bcrypt.hash(verificationCode, 12);

    user.email = updateEmailDto.email;
    user.hashed_email_verification_token = hashedVerificationToken;
    user.status = 'inactive';
    user.email_verified = false;
    await this.userRepository.save(user);

    await this.sendOtpEmail(
      user.email,
      verificationCode,
      hashedVerificationToken,
      'email-verification',
    );

    return { success: true, message: 'Verification email sent successfully' };
  }

  async resendOtp(
    email: string,
  ): Promise<{ success: boolean; message: string }> {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent OTP resend for social users
    if (user.provider !== 'email') {
      throw new BadRequestException(
        'OTP resend not available for social users',
      );
    }

    if (user.status !== 'inactive') {
      throw new BadRequestException('User is already active');
    }

    const verificationCode = this.generateSecureOtp();
    const hashedVerificationToken = await bcrypt.hash(verificationCode, 12);

    user.hashed_email_verification_token = hashedVerificationToken;
    await this.userRepository.save(user);

    const context = user.account_type
      ? 'account-reactivation'
      : 'email-verification';

    await this.sendOtpEmail(
      user.email,
      verificationCode,
      hashedVerificationToken,
      context,
    );

    return { success: true, message: 'OTP resent successfully' };
  }

  async updateStatus(
    updateStatusDto: UpdateUserStatusDto,
  ): Promise<{ success: boolean; data: User }> {
    const { userId, status } = updateStatusDto;
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Handle activation
    if (status === 'active') {
      user.status = 'active';
      user.hashed_email_verification_token = null;
    } else if (status === 'inactive') {
      user.status = 'inactive';

      // Only send reactivation email for email users
      if (user.provider === 'email' && user.status !== 'inactive') {
        const verificationCode = this.generateSecureOtp();
        const hashedVerificationToken = await bcrypt.hash(verificationCode, 12);
        user.hashed_email_verification_token = hashedVerificationToken;

        await this.sendOtpEmail(
          user.email,
          verificationCode,
          hashedVerificationToken,
          'account-reactivation',
        );
      }
    }

    const updatedUser = await this.userRepository.save(user);
    return { success: true, data: updatedUser };
  }

  async activateWithOtp({
    email,
    code,
    token,
  }: {
    email: string;
    code?: string;
    token?: string;
  }): Promise<{
    success: boolean;
    data: User;
    accessToken: string;
    refreshToken: string;
  }> {
    let user: User | null;

    if (token) {
      user = await this.userRepository
        .createQueryBuilder('user')
        .addSelect('user.hashed_email_verification_token')
        .where('user.hashed_email_verification_token = :token', { token })
        .getOne();
    } else {
      user = await this.userRepository
        .createQueryBuilder('user')
        .addSelect('user.hashed_email_verification_token')
        .where('user.email = :email', { email })
        .getOne();
    }

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Prevent activation for social users
    if (user.provider !== 'email') {
      throw new BadRequestException(
        'OTP activation not available for social users',
      );
    }

    if (token) {
      if (user.hashed_email_verification_token !== token) {
        throw new BadRequestException('Invalid verification token');
      }
    } else if (code) {
      if (!user.hashed_email_verification_token) {
        throw new BadRequestException('No verification token found');
      }

      const isCodeValid = await bcrypt.compare(
        code,
        user.hashed_email_verification_token,
      );

      if (!isCodeValid) {
        throw new BadRequestException('Invalid OTP code');
      }
    } else {
      throw new BadRequestException('Either code or token must be provided');
    }

    user.status = 'active';
    user.email_verified = true;
    user.hashed_email_verification_token = null;

    const payload: JWTPayload = {
      sub: user.user_id,
      email: user.email,
      role: user.account_type,
      userType: 'user',
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_ACCESS_EXPIRATION || '15m',
      secret: process.env.JWT_ACCESS_SECRET,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || '7d',
      secret: process.env.JWT_REFRESH_SECRET,
    });

    // Store hashed refresh token
    user.hashed_refresh_token = await bcrypt.hash(refreshToken, 12);
    const activatedUser = await this.userRepository.save(user);

    delete activatedUser.hashed_email_verification_token;
    delete activatedUser.hashed_refresh_token;
    delete activatedUser.email_verification_expiry;
    delete activatedUser.password;

    return {
      success: true,
      data: activatedUser,
      accessToken,
      refreshToken,
    };
  }

  private async sendOtpEmail(
    email: string,
    code: string,
    token: string,
    context: 'email-verification' | 'account-reactivation',
  ) {
    const emailProps = {
      otpCode: code,
      expiryMinutes: 10,
      supportEmail: 'support@example.com',
    };

    if (context === 'email-verification') {
      emailProps['verificationUrl'] =
        `${process.env.FRONTEND_URL}/verify-email?code=${token}`;
      await this.mailService.sendMfaCodeEmail(email, emailProps);
    } else {
      emailProps['reactivationUrl'] =
        `${process.env.FRONTEND_URL}/reactivate-account?code=${token}`;
      await this.mailService.sendMfaCodeEmail(email, emailProps);
    }
  }

  private generateSecureOtp(length = 6): string {
    const digits = '0123456789';
    let otp = '';
    let lastDigit: string | null = null;

    while (otp.length < length) {
      const randomDigit = digits[Math.floor(Math.random() * 10)];

      if (randomDigit === lastDigit) {
        continue;
      }

      otp += randomDigit;
      lastDigit = randomDigit;
    }

    // Ensure not all digits are the same
    if (otp.split('').every((digit) => digit === otp[0])) {
      return this.generateSecureOtp(length);
    }

    return otp;
  }

  async remove(id: string): Promise<{ success: boolean }> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.userRepository.remove(user.data);
    return { success: true };
  }

  // New method to find or create social user
  async findOrCreateSocialUser(
    provider: 'google' | 'github',
    providerId: string,
    email: string,
    profileData?: Partial<User>,
  ): Promise<User> {
    let user = await this.userRepository.findOne({
      where: { provider, provider_id: providerId },
    });

    if (!user) {
      user = this.userRepository.create({
        provider,
        provider_id: providerId,
        email,
        status: 'active',
        email_verified: true,
        ...profileData,
      });
      user = await this.userRepository.save(user);
    }

    return user;
  }
}
