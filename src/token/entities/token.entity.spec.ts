import { model, deleteModel } from 'mongoose';
import { Token, TokenSchema } from './token.entity';
import { TOKEN_TYPE } from '../constants/token-type';

describe('Token schema', () => {
  const MODEL_NAME = 'TokenSchemaTest';
  const TokenModel = model<Token>(MODEL_NAME, TokenSchema);

  afterAll(() => {
    deleteModel(MODEL_NAME);
  });

  it('asigna expiresAt por defecto a ~5 minutos en el futuro', () => {
    const before = Date.now();
    const doc = new TokenModel({
      userId: 'user-1',
      value: '123456',
      type: TOKEN_TYPE.PASSWORD_RESET,
    });

    expect(doc.expiresAt).toBeInstanceOf(Date);
    const diff = doc.expiresAt.getTime() - before;
    expect(diff).toBeGreaterThan(4 * 60 * 1000);
    expect(diff).toBeLessThanOrEqual(5 * 60 * 1000 + 1000);
  });
});
