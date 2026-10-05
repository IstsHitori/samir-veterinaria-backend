import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateOwnerDto } from './create-owner.dto';
import { OWNER_MESSAGES } from '../constants/owner-messages';

const validDto = {
  name: 'Ana',
  document: '123456',
  address: 'Calle 1',
  email: 'owner@test.com',
  telephone: '3001234567',
};

const validateDto = (data: Record<string, any>) =>
  validate(plainToInstance(CreateOwnerDto, data));

const messagesOf = (errors: any[]) =>
  errors.flatMap((e) => Object.values(e.constraints ?? {}));

describe('CreateOwnerDto', () => {
  it('acepta un payload válido', async () => {
    const errors = await validateDto(validDto);

    expect(errors).toHaveLength(0);
  });

  it('rechaza un teléfono que no tiene 10 dígitos', async () => {
    const errors = await validateDto({ ...validDto, telephone: '123' });

    expect(messagesOf(errors)).toContain(OWNER_MESSAGES.TELEPHONE_LENGTH);
  });

  it('rechaza un documento fuera del rango 6-10', async () => {
    const errors = await validateDto({ ...validDto, document: '123' });

    expect(messagesOf(errors)).toContain(OWNER_MESSAGES.DOCUMENT_LENGTH);
  });

  it('rechaza un email inválido', async () => {
    const errors = await validateDto({ ...validDto, email: 'nope' });

    expect(messagesOf(errors)).toContain(OWNER_MESSAGES.EMAIL_INVALID);
  });
});
