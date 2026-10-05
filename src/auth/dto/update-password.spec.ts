import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdatePasswordDto } from './update-password';
import { USER_VALIDATION_MESSAGES } from 'src/user/constants';

const validateDto = (data: Record<string, any>) =>
  validate(plainToInstance(UpdatePasswordDto, data));

const messagesOf = (errors: any[]) =>
  errors.flatMap((e) => Object.values(e.constraints ?? {}));

describe('UpdatePasswordDto', () => {
  it('acepta cuando la confirmación coincide y la password es compleja', async () => {
    const errors = await validateDto({
      newPassword: 'NewSecret1#',
      confirmNewPassword: 'NewSecret1#',
    });

    expect(errors).toHaveLength(0);
  });

  it('rechaza si las contraseñas no coinciden', async () => {
    const errors = await validateDto({
      newPassword: 'NewSecret1#',
      confirmNewPassword: 'OtraSecret1#',
    });

    expect(messagesOf(errors)).toContain(
      USER_VALIDATION_MESSAGES.CONFIRM_PASSWORD_MATCH,
    );
  });

  it('rechaza una nueva contraseña sin la complejidad requerida', async () => {
    const errors = await validateDto({
      newPassword: 'debil',
      confirmNewPassword: 'debil',
    });

    expect(messagesOf(errors)).toContain(
      USER_VALIDATION_MESSAGES.NEW_PASSWORD_COMPLEXITY,
    );
  });

  it('rechaza si falta la confirmación', async () => {
    const errors = await validateDto({ newPassword: 'NewSecret1#' });

    expect(messagesOf(errors)).toContain(
      USER_VALIDATION_MESSAGES.CONFIRM_PASSWORD_REQUIRED,
    );
  });
});
