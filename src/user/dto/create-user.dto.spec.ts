import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';
import { Role, USER_VALIDATION_MESSAGES } from '../constants';

const validDto = {
  firstName: 'Ana',
  lastName: 'Perez',
  email: 'ana@test.com',
  password: 'Secret123!',
  role: Role.AUXILIARY,
};

const validateDto = (data: Record<string, any>) =>
  validate(plainToInstance(CreateUserDto, data));

const messagesOf = (errors: any[]) =>
  errors.flatMap((e) => Object.values(e.constraints ?? {}));

describe('CreateUserDto', () => {
  it('acepta un payload válido', async () => {
    const errors = await validateDto(validDto);

    expect(errors).toHaveLength(0);
  });

  it('rechaza si falta el nombre', async () => {
    const { firstName, ...rest } = validDto;
    const errors = await validateDto(rest);

    expect(messagesOf(errors)).toContain(
      USER_VALIDATION_MESSAGES.FIRST_NAME_REQUIRED,
    );
  });

  it('rechaza un email inválido', async () => {
    const errors = await validateDto({ ...validDto, email: 'no-es-email' });

    expect(messagesOf(errors)).toContain(
      USER_VALIDATION_MESSAGES.EMAIL_INVALID,
    );
  });

  it('rechaza una password sin la complejidad requerida', async () => {
    const errors = await validateDto({ ...validDto, password: 'password' });

    expect(messagesOf(errors)).toContain(
      USER_VALIDATION_MESSAGES.PASSWORD_COMPLEXITY,
    );
  });

  it('rechaza un rol inválido', async () => {
    const errors = await validateDto({ ...validDto, role: 'superadmin' });

    expect(messagesOf(errors)).toContain(USER_VALIDATION_MESSAGES.ROLE_INVALID);
  });
});
