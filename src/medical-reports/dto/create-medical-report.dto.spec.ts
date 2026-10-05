import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateMedicalReportDto } from './create-medical-report.dto';
import { MEDICAL_REPORTS_MESSAGES } from '../constants/medical-report-messages';

const validateDto = (data: Record<string, any>) =>
  validate(plainToInstance(CreateMedicalReportDto, data));

const messagesOf = (errors: any[]) =>
  errors.flatMap((e) => Object.values(e.constraints ?? {}));

describe('CreateMedicalReportDto', () => {
  it('acepta un payload válido', async () => {
    const errors = await validateDto({
      patientId: '507f191e810c19729de860ea',
      details: 'Control anual',
    });

    expect(errors).toHaveLength(0);
  });

  it('rechaza si falta el patientId', async () => {
    const errors = await validateDto({ details: 'Control' });

    expect(messagesOf(errors)).toContain(
      MEDICAL_REPORTS_MESSAGES.PATIENT_ID_REQUIRED,
    );
  });

  it('rechaza si faltan los detalles', async () => {
    const errors = await validateDto({
      patientId: '507f191e810c19729de860ea',
    });

    expect(messagesOf(errors)).toContain(MEDICAL_REPORTS_MESSAGES.DETAILS_REQUIRED);
  });
});
