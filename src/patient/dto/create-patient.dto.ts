import {
  IsString,
  IsNotEmpty,
  IsDate,
  IsEnum,
  IsOptional,
  IsArray,
  IsBoolean,
  IsMongoId,
} from 'class-validator';
import { Gender, Size } from '../entities/patient.entity';
import { PATIENT_MESSAGES } from '../constants/patient-messages';

export class CreatePatientDto {
  @IsString({ message: PATIENT_MESSAGES.NAME_STRING })
  @IsNotEmpty({ message: PATIENT_MESSAGES.NAME_REQUIRED })
  name: string;

  @IsString({ message: PATIENT_MESSAGES.BREED_STRING })
  @IsNotEmpty({ message: PATIENT_MESSAGES.BREED_REQUIRED })
  breed: string;

  @IsDate({ message: PATIENT_MESSAGES.BIRTHDATE_DATE })
  @IsNotEmpty({ message: PATIENT_MESSAGES.BIRTHDATE_REQUIRED })
  birthDate: Date;

  @IsEnum(Gender, { message: PATIENT_MESSAGES.GENDER_INVALID })
  @IsNotEmpty({ message: PATIENT_MESSAGES.GENDER_REQUIRED })
  gender: Gender;

  @IsString({ message: PATIENT_MESSAGES.WEIGHT_STRING })
  @IsNotEmpty({ message: PATIENT_MESSAGES.WEIGHT_REQUIRED })
  weight: string;

  @IsEnum(Size, { message: PATIENT_MESSAGES.SIZE_INVALID })
  @IsNotEmpty({ message: PATIENT_MESSAGES.SIZE_REQUIRED })
  size: Size;

  @IsString({ message: PATIENT_MESSAGES.HISTORY_STRING })
  @IsOptional()
  history?: string;

  @IsMongoId({ message: PATIENT_MESSAGES.OWNERID_MONGOID })
  @IsNotEmpty({ message: PATIENT_MESSAGES.OWNERID_REQUIRED })
  ownerId: string;

  @IsArray({ message: PATIENT_MESSAGES.MEDICALCONDITIONS_ARRAY })
  @IsString({ each: true, message: PATIENT_MESSAGES.MEDICALCONDITIONS_STRING })
  @IsOptional()
  medicalConditions?: string[];

  @IsArray({ message: PATIENT_MESSAGES.ALLERGIES_ARRAY })
  @IsString({ each: true, message: PATIENT_MESSAGES.ALLERGIES_STRING })
  @IsOptional()
  allergies?: string[];

  @IsBoolean({ message: PATIENT_MESSAGES.ISVACCINATED_BOOLEAN })
  @IsOptional()
  isVaccinated?: boolean;

  @IsArray({ message: PATIENT_MESSAGES.VACCINES_ARRAY })
  @IsString({ each: true, message: PATIENT_MESSAGES.VACCINES_STRING })
  @IsOptional()
  vaccines?: string[];

  @IsBoolean({ message: PATIENT_MESSAGES.ISACTIVE_BOOLEAN })
  @IsOptional()
  isActive?: boolean;

  @IsDate({ message: PATIENT_MESSAGES.DELETEDAT_DATE })
  @IsOptional()
  deletedAt?: Date | null;

  @IsMongoId({ message: PATIENT_MESSAGES.DELETEDBY_MONGOID })
  @IsOptional()
  deletedBy?: string | null;

  @IsBoolean({ message: PATIENT_MESSAGES.ISDELETED_BOOLEAN })
  @IsOptional()
  isDeleted?: boolean;
}
