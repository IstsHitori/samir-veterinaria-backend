import {
  IsString,
  IsEmail,
  IsNotEmpty,
  Length,
  Matches,
} from 'class-validator';
import { OWNER_MESSAGES } from '../constants/owner-messages';

export class CreateOwnerDto {
  @IsNotEmpty({ message: OWNER_MESSAGES.NAME_REQUIRED })
  @IsString({ message: OWNER_MESSAGES.NAME_STRING })
  name: string;

  @IsNotEmpty({ message: OWNER_MESSAGES.DOCUMENT_REQUIRED })
  @IsString({ message: OWNER_MESSAGES.DOCUMENT_STRING })
  @Length(6, 10, { message: OWNER_MESSAGES.DOCUMENT_LENGTH })
  document: string;

  @IsNotEmpty({ message: OWNER_MESSAGES.ADDRESS_REQUIRED })
  @IsString({ message: OWNER_MESSAGES.ADDRESS_STRING })
  address: string;

  @IsNotEmpty({ message: OWNER_MESSAGES.EMAIL_REQUIRED })
  @IsEmail({}, { message: OWNER_MESSAGES.EMAIL_INVALID })
  email: string;

  @IsNotEmpty({ message: OWNER_MESSAGES.TELEPHONE_REQUIRED })
  @IsString({ message: OWNER_MESSAGES.TELEPHONE_STRING })
  @Matches(/^\d{10}$/, {
    message: OWNER_MESSAGES.TELEPHONE_LENGTH,
  })
  telephone: string;
}
