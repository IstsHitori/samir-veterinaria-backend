import { IsString, IsNotEmpty } from 'class-validator';
import { MEDICAL_REPORTS_MESSAGES } from '../constants/medical-report-messages';

export class CreateMedicalReportDto {
  @IsNotEmpty({ message: MEDICAL_REPORTS_MESSAGES.PATIENT_ID_REQUIRED })
  @IsString({ message: MEDICAL_REPORTS_MESSAGES.PATIENT_ID_INVALID })
  patientId: string;

  @IsNotEmpty({ message: MEDICAL_REPORTS_MESSAGES.DETAILS_REQUIRED })
  @IsString({ message: MEDICAL_REPORTS_MESSAGES.DETAILS_STRING })
  details: string;
}
