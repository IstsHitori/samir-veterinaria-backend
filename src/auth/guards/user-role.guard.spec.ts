import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { UserRoleGuard } from './user-role.guard';
import { Role } from 'src/user/constants';

const buildContext = (user?: any) =>
  ({
    getHandler: jest.fn(),
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  }) as any;

describe('UserRoleGuard', () => {
  let reflector: { get: jest.Mock };
  let guard: UserRoleGuard;

  beforeEach(() => {
    reflector = { get: jest.fn() };
    guard = new UserRoleGuard(reflector as any);
  });

  it('permite el paso si no hay roles requeridos (undefined)', () => {
    reflector.get.mockReturnValue(undefined);

    expect(guard.canActivate(buildContext())).toBe(true);
  });

  it('permite el paso si la lista de roles está vacía', () => {
    reflector.get.mockReturnValue([]);

    expect(guard.canActivate(buildContext())).toBe(true);
  });

  it('permite el paso si el rol del usuario está permitido', () => {
    reflector.get.mockReturnValue([Role.ADMIN, Role.AUXILIARY]);

    const context = buildContext({ role: Role.ADMIN, firstName: 'Ana' });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('lanza BadRequest si no hay usuario en el request', () => {
    reflector.get.mockReturnValue([Role.ADMIN]);

    expect(() => guard.canActivate(buildContext(undefined))).toThrow(
      BadRequestException,
    );
  });

  it('lanza Forbidden si el rol del usuario no está permitido', () => {
    reflector.get.mockReturnValue([Role.ADMIN]);

    const context = buildContext({ role: Role.VETERINARY, firstName: 'Bob' });

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});
