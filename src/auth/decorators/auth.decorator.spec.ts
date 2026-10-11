import { Auth } from './auth.decorator';
import { Role } from 'src/user/constants';

describe('Auth decorator', () => {
  it('construye un decorador aplicable con roles', () => {
    const decorator = Auth(Role.ADMIN, Role.AUXILIARY);

    expect(typeof decorator).toBe('function');
  });

  it('construye un decorador aplicable sin roles', () => {
    expect(typeof Auth()).toBe('function');
  });
});
