import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ValidateTokenDto } from './validate-token';
import { TOKEN_MESSAGES } from 'src/common/constants/token-messages';

const validateDto = (data: Record<string, any>) =>
  validate(plainToInstance(ValidateTokenDto, data));

const messagesOf = (errors: any[]) =>
  errors.flatMap((e) => Object.values(e.constraints ?? {}));

describe('ValidateTokenDto', () => {
  it('acepta un token de 6 caracteres', async () => {
    const errors = await validateDto({ token: '123456' });

    expect(errors).toHaveLength(0);
  });

  it('rechaza un token con longitud incorrecta', async () => {
    const errors = await validateDto({ token: '123' });

    expect(messagesOf(errors)).toContain(TOKEN_MESSAGES.TOKEN_LENGTH);
  });

  it('rechaza si el token está vacío', async () => {
    const errors = await validateDto({ token: '' });

    expect(errors.length).toBeGreaterThan(0);
  });
});
