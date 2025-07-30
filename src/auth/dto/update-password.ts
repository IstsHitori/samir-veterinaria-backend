/* eslint-disable @typescript-eslint/no-unused-vars */
import { IsString, Matches, IsNotEmpty, Validate } from 'class-validator';
import { USER_VALIDATION_MESSAGES } from 'src/user/constants';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

@ValidatorConstraint({ name: 'passwordMatch', async: false })
class PasswordMatchConstraint implements ValidatorConstraintInterface {
  validate(confirmNewPassword: string, args: ValidationArguments) {
    const object = args.object as UpdatePasswordDto;
    return object.newPassword === confirmNewPassword;
  }

  defaultMessage(args: ValidationArguments) {
    return USER_VALIDATION_MESSAGES.CONFIRM_PASSWORD_MATCH;
  }
}

export class UpdatePasswordDto {
  @IsNotEmpty({ message: USER_VALIDATION_MESSAGES.NEW_PASSWORD_REQUIRED })
  @IsString({ message: USER_VALIDATION_MESSAGES.NEW_PASSWORD_STRING })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$#])[A-Za-z\d@$#]{8,}$/, {
    message: USER_VALIDATION_MESSAGES.NEW_PASSWORD_COMPLEXITY,
  })
  newPassword: string;

  @IsNotEmpty({ message: USER_VALIDATION_MESSAGES.CONFIRM_PASSWORD_REQUIRED })
  @IsString({ message: USER_VALIDATION_MESSAGES.CONFIRM_PASSWORD_STRING })
  @Validate(PasswordMatchConstraint)
  confirmNewPassword: string;
}
