import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Ip,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Public } from './decorators/public.decorators';
import { AccessTokenGuard } from './guards/access-token.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { PermissionHelper } from 'src/shared/helpers/permission.helper';
import { RequestWithUser } from 'src/shared/types/request.types';
import { RequestResetPasswordDto } from './dto/request-reset-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { AuthGuard } from '@nestjs/passport';
import { SocialLoginDto } from './dto/social-login.dto'; // New DTO
import { GoogleOauthGuard } from './guards/google-auth.guard';
import { Profile as GoogleProfile } from 'passport-google-oauth20';
import { Profile as GitHubProfile } from 'passport-github';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly permissionHelper: PermissionHelper,
  ) {}

  @Public()
  @Post('signin')
  signIn(
    @Body() createAuthDto: CreateAuthDto,
    @Ip() ipAddress: string,
    @Req() req: Request,
  ) {
    const userAgent =
      typeof req.headers['user-agent'] === 'string'
        ? req.headers['user-agent']
        : 'UNKNOWN';

    return this.authService.signIn(createAuthDto, ipAddress, userAgent);
  }

  @Public()
  @Post('social')
  socialLogin(
    @Body() socialLoginDto: SocialLoginDto,
    @Ip() ipAddress: string,
    @Req() req: Request,
  ) {
    const userAgent =
      typeof req.headers['user-agent'] === 'string'
        ? req.headers['user-agent']
        : 'UNKNOWN';

    return this.authService.socialLogin(socialLoginDto, ipAddress, userAgent);
  }

  // GitHub authentication endpoints
  @Public()
  @Get('github')
  @UseGuards(AuthGuard('github'))
  async githubLogin() {}

  @Public()
  @Get('github/callback')
  @UseGuards(AuthGuard('github'))
  async githubAuthCallback(
    @Req()
    req: Request & {
      user: GitHubProfile;
    },
    @Res() res: Response,
    @Ip() ip: string,
  ) {
    const profile = req.user;
    const socialLoginDto: SocialLoginDto = {
      provider: 'github',
      providerId: profile.id,
      email: profile.emails?.[0]?.value || '',
      firstName:
        profile.displayName?.split(' ')[0] || profile.username || 'Unknown',
      lastName: profile.displayName?.split(' ')[1] || '',
      profilePicture: profile.photos?.[0]?.value || '',
    };

    const result = await this.authService.socialLogin(
      socialLoginDto,
      ip,
      req.headers['user-agent'] as string,
    );

    const redirectUrl = new URL(`${process.env.FRONTEND_URL}/auth/callback`);
    redirectUrl.searchParams.set('accessToken', result.data.accessToken);
    redirectUrl.searchParams.set('refreshToken', result.data.refreshToken);

    res.redirect(redirectUrl.toString());
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleOauthGuard)
  async googleLogin() {}

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleOauthGuard)
  async googleAuthCallback(
    @Req()
    req: Request & {
      user: GoogleProfile;
    },
    @Res() res: Response,
    @Ip() ip: string,
  ) {
    const profile = req.user;
    const socialLoginDto: SocialLoginDto = {
      provider: 'google',
      providerId: profile.id,
      email: profile.emails?.[0]?.value || '',
      firstName: profile.name?.givenName || 'Unknown',
      lastName: profile.name?.familyName || '',
      profilePicture: profile.photos?.[0]?.value || '',
    };

    const result = await this.authService.socialLogin(
      socialLoginDto,
      ip,
      req.headers['user-agent'] as string,
    );

    const redirectUrl = new URL(`${process.env.FRONTEND_URL}/auth/callback`);
    redirectUrl.searchParams.set('accessToken', result.data.accessToken);
    redirectUrl.searchParams.set('refreshToken', result.data.refreshToken);

    res.redirect(redirectUrl.toString());
  }

  @Public()
  @Post('request-reset-password')
  requestResetPassword(
    @Body() requestResetPasswordDto: RequestResetPasswordDto,
  ) {
    return this.authService.requestPasswordReset(requestResetPasswordDto);
  }

  @Public()
  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @ApiBearerAuth()
  @UseGuards(AccessTokenGuard)
  @Delete('signout/:id')
  signOut(@Param('id') id: string, @Req() req: RequestWithUser) {
    this.permissionHelper.checkPermission(id, req.user);
    return this.authService.signOut(id, req.user.userType as 'admin' | 'user');
  }

  @Public()
  @UseGuards(RefreshTokenGuard)
  @Post('refresh')
  refreshToken(@Body() body: { refreshToken: string }) {
    console.log(body);
    return this.authService.refreshToken(body.refreshToken);
  }
}
