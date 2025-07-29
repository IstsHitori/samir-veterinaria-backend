/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsString,
  IsEmail,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsNotEmpty,
  Matches,
  IsDate,
} from 'class-validator';

import { Role, USER_VALIDATION_MESSAGES } from '../constants';

export class CreateUserDto {
  @IsString({ message: USER_VALIDATION_MESSAGES.FIRST_NAME_STRING })
  @IsNotEmpty({ message: USER_VALIDATION_MESSAGES.FIRST_NAME_REQUIRED })
  firstName: string;

  @IsString({ message: USER_VALIDATION_MESSAGES.LAST_NAME_STRING })
  @IsNotEmpty({ message: USER_VALIDATION_MESSAGES.LAST_NAME_REQUIRED })
  lastName: string;

  @IsEmail({}, { message: USER_VALIDATION_MESSAGES.EMAIL_INVALID })
  @IsNotEmpty({ message: USER_VALIDATION_MESSAGES.EMAIL_REQUIRED })
  email: string;

  @IsString({ message: USER_VALIDATION_MESSAGES.PASSWORD_STRING })
  @IsNotEmpty({ message: USER_VALIDATION_MESSAGES.PASSWORD_REQUIRED })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$#!%*?&])[A-Za-z\d@$#!%*?&]{8,}$/,
    { message: USER_VALIDATION_MESSAGES.PASSWORD_COMPLEXITY },
  )
  password: string;

  @IsEnum(Role, { message: USER_VALIDATION_MESSAGES.ROLE_INVALID })
  @IsNotEmpty({ message: USER_VALIDATION_MESSAGES.ROLE_REQUIRED })
  role: Role;

  @IsBoolean({ message: USER_VALIDATION_MESSAGES.EMAIL_VALIDATED_BOOLEAN })
  @IsOptional()
  emailValidated?: boolean;

  @IsDate({ message: USER_VALIDATION_MESSAGES.DELETED_AT_DATE })
  @IsOptional()
  deletedAt?: Date;

  @IsBoolean({ message: USER_VALIDATION_MESSAGES.IS_DELETED_BOOLEAN })
  @IsOptional()
  isDeleted?: boolean;

  @IsBoolean({ message: USER_VALIDATION_MESSAGES.IS_ACTIVE_BOOLEAN })
  @IsOptional()
  isActive?: boolean;

  @IsDate({ message: USER_VALIDATION_MESSAGES.LAST_LOGIN_DATE })
  @IsOptional()
  lastLogin?: Date;
}
