import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreatePatientDto } from './create-patient.dto';
import { PATIENT_MESSAGES } from '../constants/patient-messages';
import { Gender, Size, Species } from '../entities/patient.entity';

const validDto = {
  name: 'Firulais',
  type: Species.DOG,
  breed: 'Labrador',
  birthDate: new Date('2020-01-01'),
  gender: Gender.MALE,
  weight: '20',
  size: Size.MEDIUM,
  ownerId: '507f191e810c19729de860ea',
};

const validateDto = (data: Record<string, any>) =>
  validate(plainToInstance(CreatePatientDto, data));

const messagesOf = (errors: any[]) =>
  errors.flatMap((e) => Object.values(e.constraints ?? {}));

describe('CreatePatientDto', () => {
  it('acepta un payload válido', async () => {
    const errors = await validateDto(validDto);

    expect(errors).toHaveLength(0);
  });

  it('rechaza un tipo de mascota inválido', async () => {
    const errors = await validateDto({ ...validDto, type: 'dragon' });

    expect(messagesOf(errors)).toContain(PATIENT_MESSAGES.TYPE_PET_INVALID);
  });

  it('rechaza un género inválido', async () => {
    const errors = await validateDto({ ...validDto, gender: 'otro' });

    expect(messagesOf(errors)).toContain(PATIENT_MESSAGES.GENDER_INVALID);
  });

  it('rechaza un ownerId que no es MongoId', async () => {
    const errors = await validateDto({ ...validDto, ownerId: 'no-id' });

    expect(messagesOf(errors)).toContain(PATIENT_MESSAGES.OWNERID_MONGOID);
  });

  it('rechaza si falta el nombre', async () => {
    const { name, ...rest } = validDto;
    const errors = await validateDto(rest);

    expect(messagesOf(errors)).toContain(PATIENT_MESSAGES.NAME_REQUIRED);
  });
});
