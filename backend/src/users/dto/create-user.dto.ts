import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsOptional,
  IsPhoneNumber,
  IsIn,
} from 'class-validator';
import { AuthProvider } from 'src/seed';
export class CreateUserDto {
  @ApiPropertyOptional({ description: 'The first name of the user' })
  @IsOptional()
  @IsString()
  first_name?: string;

  @ApiPropertyOptional({ description: 'The last name of the user' })
  @IsOptional()
  @IsString()
  last_name?: string;

  @ApiPropertyOptional({ description: 'Auth Provider' })
  @IsOptional()
  @IsIn(['email', 'github', 'google'])
  provider?: AuthProvider;

  @ApiProperty({ description: 'The email address of the user' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'The password for the user account' })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiPropertyOptional({
    description: 'The phone number of the user',
  })
  @IsOptional()
  @IsPhoneNumber()
  phone_number?: string;

  @ApiPropertyOptional({
    description: 'The profile picture URL of the user',
  })
  @IsOptional()
  profile_picture?: string;
}
