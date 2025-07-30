import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { USER_VALIDATION_MESSAGES } from '../constants';

export class LoginUserDto {
  @IsEmail({}, { message: USER_VALIDATION_MESSAGES.EMAIL_INVALID })
  @IsNotEmpty({ message: USER_VALIDATION_MESSAGES.EMAIL_REQUIRED })
  email: string;
  @IsString({ message: USER_VALIDATION_MESSAGES.PASSWORD_STRING })
  @IsNotEmpty({ message: USER_VALIDATION_MESSAGES.PASSWORD_REQUIRED })
  password: string;
}
