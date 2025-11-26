import { IsEmail, IsOptional, IsString } from 'class-validator';

export class ActivateOtpDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  code?: string;

  @IsString()
  @IsOptional()
  token?: string;
}
