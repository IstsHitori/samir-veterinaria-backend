import { generateNumericToken } from './number-token';

describe('generateNumericToken', () => {
  it('genera un token numérico de 6 dígitos por defecto', () => {
    const token = generateNumericToken();

    expect(token).toHaveLength(6);
    expect(token).toMatch(/^\d{6}$/);
  });

  it('respeta un largo personalizado', () => {
    expect(generateNumericToken(10)).toHaveLength(10);
    expect(generateNumericToken(3)).toMatch(/^\d{3}$/);
  });

  it('no es determinístico (genera valores distintos)', () => {
    const tokens = new Set(
      Array.from({ length: 30 }, () => generateNumericToken()),
    );

    expect(tokens.size).toBeGreaterThan(1);
  });
});
