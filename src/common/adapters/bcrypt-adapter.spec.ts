import { BcryptAdapter } from './bcrypt-adapter';

describe('BcryptAdapter', () => {
  let adapter: BcryptAdapter;

  beforeEach(() => {
    adapter = new BcryptAdapter();
  });

  it('hashea la contraseña (no deja el texto plano)', async () => {
    const hash = await adapter.hash('Secret123!');

    expect(hash).not.toBe('Secret123!');
    expect(hash.length).toBeGreaterThan(20);
  });

  it('genera hashes distintos para la misma contraseña (salt)', async () => {
    const [hashA, hashB] = await Promise.all([
      adapter.hash('Secret123!'),
      adapter.hash('Secret123!'),
    ]);

    expect(hashA).not.toBe(hashB);
  });

  it('compara correctamente una contraseña válida', async () => {
    const hash = await adapter.hash('Secret123!');

    await expect(adapter.compare('Secret123!', hash)).resolves.toBe(true);
  });

  it('rechaza una contraseña inválida', async () => {
    const hash = await adapter.hash('Secret123!');

    await expect(adapter.compare('Otra123!', hash)).resolves.toBe(false);
  });
});
