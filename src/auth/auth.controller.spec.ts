import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let authService: Record<string, jest.Mock>;
  let controller: AuthController;

  beforeEach(() => {
    authService = {
      create: jest.fn(),
      login: jest.fn(),
      forgotPassword: jest.fn(),
      validateToken: jest.fn(),
      updatePassword: jest.fn(),
    };
    controller = new AuthController(authService as unknown as AuthService);
  });

  it('getUserProfile retorna el perfil del usuario autenticado', () => {
    const user = { _id: '1', firstName: 'Ana' } as any;

    expect(controller.getUserProfile(user)).toEqual({ profile: user });
  });

  it('create delega en authService.create', async () => {
    authService.create.mockResolvedValue('ok');
    const dto = { email: 'a@a.com' } as any;

    await expect(controller.create(dto)).resolves.toBe('ok');
    expect(authService.create).toHaveBeenCalledWith(dto);
  });

  it('login delega en authService.login', async () => {
    authService.login.mockResolvedValue({ token: 'jwt' });
    const dto = { email: 'a@a.com', password: 'x' } as any;

    await expect(controller.login(dto)).resolves.toEqual({ token: 'jwt' });
    expect(authService.login).toHaveBeenCalledWith(dto);
  });

  it('forgotPassword delega en authService.forgotPassword', async () => {
    authService.forgotPassword.mockResolvedValue('ok');
    const dto = { email: 'a@a.com' } as any;

    await expect(controller.forgotPassword(dto)).resolves.toBe('ok');
    expect(authService.forgotPassword).toHaveBeenCalledWith(dto);
  });

  it('validateToken delega en authService.validateToken', async () => {
    authService.validateToken.mockResolvedValue('ok');
    const dto = { token: '123456' } as any;

    await expect(controller.validateToken(dto)).resolves.toBe('ok');
    expect(authService.validateToken).toHaveBeenCalledWith(dto);
  });

  it('updatePassword delega con token y dto', async () => {
    authService.updatePassword.mockResolvedValue('ok');
    const dto = { newPassword: 'a' } as any;

    await expect(controller.updatePassword('123456', dto)).resolves.toBe('ok');
    expect(authService.updatePassword).toHaveBeenCalledWith(dto, '123456');
  });
});
