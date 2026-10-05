import { BadRequestException } from '@nestjs/common';
import { ParseTokenPipe } from './parse-token.pipe';
import { TOKEN_MESSAGES } from 'src/common/constants/token-messages';

describe('ParseTokenPipe', () => {
  let pipe: ParseTokenPipe;

  beforeEach(() => {
    pipe = new ParseTokenPipe();
  });

  const metadata = {} as any;

  it('retorna el valor cuando tiene exactamente 6 caracteres', () => {
    expect(pipe.transform('123456', metadata)).toBe('123456');
  });

  it('lanza BadRequest si el token está vacío', () => {
    expect(() => pipe.transform('', metadata)).toThrow(BadRequestException);
    expect(() => pipe.transform('', metadata)).toThrow(
      TOKEN_MESSAGES.TOKEN_REQUIRED,
    );
  });

  it('lanza BadRequest si el token tiene menos de 6 caracteres', () => {
    expect(() => pipe.transform('12345', metadata)).toThrow(
      TOKEN_MESSAGES.TOKEN_LENGTH,
    );
  });

  it('lanza BadRequest si el token tiene más de 6 caracteres', () => {
    expect(() => pipe.transform('1234567', metadata)).toThrow(
      TOKEN_MESSAGES.TOKEN_LENGTH,
    );
  });
});
