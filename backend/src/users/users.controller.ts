import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
} from '@nestjs/common';
import { UserService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserFilterDto } from './dto/user-filter.dto';
import { User } from './entities/user.entity';
import { Public } from 'src/auth/decorators/public.decorators';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from 'src/auth/decorators/roles.decorators';
import { Role } from 'src/auth/enums/role.enum';
import { PermissionHelper } from 'src/shared/helpers/permission.helper';
import { RequestWithUser } from 'src/shared/types/request.types';
import { UpdateAccountTypeDto } from './dto/update-account-type.dto';
import { UpdateUserStatusDto } from './dto/update-status.dto';
import { UpdateEmailDto } from './dto/update-user-email.dto';
import { ResendOtpDto } from './dto/resend-otp.dto';
import { ActivateOtpDto } from './dto/activate-otp.dto';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly permissionHelper: PermissionHelper,
  ) {}

  @Public()
  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
  ): Promise<{ success: boolean; data: User }> {
    return await this.userService.create(createUserDto);
  }

  @Roles(
    Role.SYSTEM_ADMIN,
    Role.QUOTATIONS_ADMIN,
    Role.SUPPORT_ADMIN,
    Role.SUPER_ADMIN,
  )
  @ApiBearerAuth()
  @Get()
  findAll(@Query() filter: UserFilterDto) {
    return this.userService.findAll(filter);
  }

  @Roles(
    Role.FREE_USER,
    Role.PREMIUM_USER,
    Role.SYSTEM_ADMIN,
    Role.QUOTATIONS_ADMIN,
    Role.SUPPORT_ADMIN,
    Role.SUPER_ADMIN,
  )
  @ApiBearerAuth()
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<{ success: boolean; data: User }> {
    this.permissionHelper.checkPermission(id, req.user);
    return await this.userService.findOne(id);
  }

  @Roles(
    Role.FREE_USER,
    Role.PREMIUM_USER,
    Role.SYSTEM_ADMIN,
    Role.QUOTATIONS_ADMIN,
    Role.SUPPORT_ADMIN,
    Role.SUPER_ADMIN,
  )
  @ApiBearerAuth()
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<{ success: boolean; data: User }> {
    this.permissionHelper.checkPermission(id, req.user);
    return await this.userService.update(id, updateUserDto);
  }

  @Roles(Role.SYSTEM_ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @Patch('account-type')
  async updateAccountType(@Body() updateAccountTypeDto: UpdateAccountTypeDto) {
    return this.userService.updateAccountType(updateAccountTypeDto);
  }

  @Roles(Role.SYSTEM_ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @Patch('status')
  async updateStatus(@Body() updateStatusDto: UpdateUserStatusDto) {
    return this.userService.updateStatus(updateStatusDto);
  }

  @Roles(
    Role.FREE_USER,
    Role.PREMIUM_USER,
    Role.SYSTEM_ADMIN,
    Role.QUOTATIONS_ADMIN,
    Role.SUPPORT_ADMIN,
    Role.SUPER_ADMIN,
  )
  @ApiBearerAuth()
  @Patch('update-email/:userId')
  async updateUserEmail(
    @Param('userId') userId: string,
    @Body() updateEmailDto: UpdateEmailDto,
  ) {
    return this.userService.updateEmail(userId, updateEmailDto);
  }

  @Roles(
    Role.FREE_USER,
    Role.PREMIUM_USER,
    Role.SYSTEM_ADMIN,
    Role.QUOTATIONS_ADMIN,
    Role.SUPPORT_ADMIN,
    Role.SUPER_ADMIN,
  )
  @ApiBearerAuth()
  @Post('resend-otp')
  async resendOtp(@Body() resendOtpDto: ResendOtpDto) {
    return this.userService.resendOtp(resendOtpDto.email);
  }

  @Public()
  @Post('verify-with-otp')
  async activateOtp(@Body() activateOtpDto: ActivateOtpDto) {
    return this.userService.activateWithOtp(activateOtpDto);
  }

  @Roles(Role.SYSTEM_ADMIN, Role.SUPER_ADMIN)
  @ApiBearerAuth()
  @Delete(':id')
  remove(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.userService.remove(id);
  }
}
