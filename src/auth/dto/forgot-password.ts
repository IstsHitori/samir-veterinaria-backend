import { IsEmail, IsNotEmpty } from 'class-validator';
import { USER_VALIDATION_MESSAGES } from 'src/user/constants';

export class ForgotPasswordDto {
  @IsEmail({}, { message: USER_VALIDATION_MESSAGES.EMAIL_INVALID })
  @IsNotEmpty({ message: USER_VALIDATION_MESSAGES.EMAIL_REQUIRED })
  email: string;
}
