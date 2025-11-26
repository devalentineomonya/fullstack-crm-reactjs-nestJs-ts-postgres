import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-github';
import { VerifiedCallback } from 'passport-jwt';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.getOrThrow<string>('GITHUB_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GITHUB_CALLBACK_URL'),
      scope: ['user:email'],
      userAgent: 'Nexus',
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifiedCallback,
  ): Promise<any> {
    const { displayName, emails, photos, id, username } = profile;

    const email = emails?.[0]?.value || '';

    const userProfile = {
      provider: 'github',
      id,
      email,
      firstName: displayName.split(' ')[0] || username || '',
      lastName: displayName.split(' ')[1] || '',
      photos,
      accessToken,
    };
    done(null, userProfile);
    return Promise.resolve(userProfile);
  }
}
