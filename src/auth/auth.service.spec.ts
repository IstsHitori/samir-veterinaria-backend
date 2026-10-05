import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Role, USER_VALIDATION_MESSAGES } from 'src/user/constants';
import { TOKEN_MESSAGES } from 'src/common/constants/token-messages';
import { TOKEN_TYPE } from 'src/token/constants/token-type';

const VALID_ID = '507f1f77bcf86cd799439011';

const buildUser = (overrides: Record<string, any> = {}) => ({
  _id: VALID_ID,
  email: 'user@test.com',
  password: 'hashed-original',
  role: Role.AUXILIARY as Role,
  isActive: true,
  isDeleted: false,
  emailValidated: false,
  save: jest.fn().mockResolvedValue(true),
  ...overrides,
});

describe('AuthService', () => {
  let userCtor: any;
  let tokenCtor: any;
  let userDoc: any;
  let tokenDoc: any;
  let encryption: any;
  let mailService: any;
  let configService: any;
  let userService: any;
  let tokenService: any;
  let jwtService: any;
  let service: AuthService;

  beforeEach(() => {
    userDoc = buildUser();
    tokenDoc = {
      value: '123456',
      userId: VALID_ID,
      type: TOKEN_TYPE.CONFIRMATION,
      save: jest.fn().mockResolvedValue(true),
      deleteOne: jest.fn().mockResolvedValue({}),
    };
    userCtor = jest.fn(() => userDoc);
    userCtor.findOne = jest.fn();
    tokenCtor = jest.fn(() => tokenDoc);
    encryption = {
      hash: jest.fn().mockResolvedValue('hashed'),
      compare: jest.fn(),
    };
    mailService = { sendEmail: jest.fn().mockResolvedValue(true) };
    configService = {
      get: jest.fn().mockReturnValue('http://localhost:3000'),
    };
    userService = { findUserByEmail: jest.fn(), findOne: jest.fn() };
    tokenService = { findOneByToken: jest.fn() };
    jwtService = { sign: jest.fn().mockReturnValue('jwt.token') };

    service = new AuthService(
      userCtor,
      tokenCtor,
      encryption,
      mailService,
      configService,
      userService,
      tokenService,
      jwtService,
    );
  });

  describe('create', () => {
    const dto = {
      email: 'new@test.com',
      password: 'Secret123!',
      role: Role.AUXILIARY,
      firstName: 'Ana',
      lastName: 'Perez',
    };

    it('registra al usuario: hashea la password, guarda usuario y token y envía el email', async () => {
      userService.findUserByEmail.mockResolvedValue(null);

      const result = await service.create(dto as any);

      expect(encryption.hash).toHaveBeenCalledWith('Secret123!');
      expect(userDoc.password).toBe('hashed');
      expect(userDoc.save).toHaveBeenCalled();
      expect(tokenDoc.save).toHaveBeenCalled();
      expect(mailService.sendEmail).toHaveBeenCalledWith(
        expect.objectContaining({ to: userDoc.email }),
      );
      expect(result).toBe('Se ha registrado la cuenta correctamente');
    });

    it('lanza BadRequest si el email ya existe', async () => {
      userService.findUserByEmail.mockResolvedValue(buildUser());

      await expect(service.create(dto as any)).rejects.toThrow(
        USER_VALIDATION_MESSAGES.USER_ALREADY_EXIST,
      );
      expect(encryption.hash).not.toHaveBeenCalled();
    });

    it('lanza BadRequest si ya existe un admin y se intenta crear otro', async () => {
      userCtor.findOne.mockResolvedValue(buildUser({ role: Role.ADMIN }));

      await expect(
        service.create({ ...dto, role: Role.ADMIN } as any),
      ).rejects.toThrow(USER_VALIDATION_MESSAGES.CANT_BE_ADMIN);
    });

    it('lanza BadRequest si falla el envío del email', async () => {
      userService.findUserByEmail.mockResolvedValue(null);
      mailService.sendEmail.mockResolvedValue(false);

      await expect(service.create(dto as any)).rejects.toThrow(
        USER_VALIDATION_MESSAGES.SEND_MAIL_ERROR,
      );
    });
  });

  describe('login', () => {
    it('retorna el token JWT cuando las credenciales son válidas', async () => {
      userService.findUserByEmail.mockResolvedValue(buildUser());
      encryption.compare.mockResolvedValue(true);

      const result = await service.login({
        email: 'user@test.com',
        password: 'Secret123!',
      } as any);

      expect(result).toEqual({ token: 'jwt.token' });
      expect(jwtService.sign).toHaveBeenCalledWith({ id: VALID_ID });
    });

    it('lanza BadRequest cuando la contraseña no coincide', async () => {
      userService.findUserByEmail.mockResolvedValue(buildUser());
      encryption.compare.mockResolvedValue(false);

      await expect(
        service.login({ email: 'user@test.com', password: 'mala' } as any),
      ).rejects.toThrow(USER_VALIDATION_MESSAGES.PASSWORD_INVALID);
    });

    it('lanza NotFound si el usuario no existe', async () => {
      userService.findUserByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'no@test.com', password: 'x' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('confirmAccount', () => {
    it('confirma la cuenta, marca emailValidated y elimina el token', async () => {
      const token = {
        type: TOKEN_TYPE.CONFIRMATION,
        userId: VALID_ID,
        deleteOne: jest.fn().mockResolvedValue({}),
      };
      tokenService.findOneByToken.mockResolvedValue(token);
      const user = buildUser();
      userService.findOne.mockResolvedValue(user);

      const result = await service.confirmAccount('123456');

      expect(user.emailValidated).toBe(true);
      expect(user.save).toHaveBeenCalled();
      expect(token.deleteOne).toHaveBeenCalled();
      expect(result).toBe('Cuenta confirmada correctamente');
    });

    it('lanza NotFound si el token no existe', async () => {
      tokenService.findOneByToken.mockResolvedValue(null);

      await expect(service.confirmAccount('123456')).rejects.toThrow(
        TOKEN_MESSAGES.TOKEN_NOT_FOUND,
      );
    });

    it('lanza BadRequest si el token no es de confirmación', async () => {
      tokenService.findOneByToken.mockResolvedValue({
        type: TOKEN_TYPE.PASSWORD_RESET,
      });

      await expect(service.confirmAccount('123456')).rejects.toThrow(
        TOKEN_MESSAGES.TOKEN_INVALID,
      );
    });

    it('lanza NotFound si el usuario no existe o está eliminado', async () => {
      tokenService.findOneByToken.mockResolvedValue({
        type: TOKEN_TYPE.CONFIRMATION,
        userId: VALID_ID,
        deleteOne: jest.fn(),
      });
      userService.findOne.mockResolvedValue(null);

      await expect(service.confirmAccount('123456')).rejects.toThrow(
        USER_VALIDATION_MESSAGES.USER_NOT_FOUND,
      );
    });

    it('lanza BadRequest si el usuario está inactivo', async () => {
      tokenService.findOneByToken.mockResolvedValue({
        type: TOKEN_TYPE.CONFIRMATION,
        userId: VALID_ID,
        deleteOne: jest.fn(),
      });
      userService.findOne.mockResolvedValue(buildUser({ isActive: false }));

      await expect(service.confirmAccount('123456')).rejects.toThrow(
        USER_VALIDATION_MESSAGES.USER_INACTIVE,
      );
    });
  });

  describe('forgotPassword', () => {
    it('genera un token y envía el email de recuperación', async () => {
      userService.findUserByEmail.mockResolvedValue(buildUser());

      const result = await service.forgotPassword({
        email: 'user@test.com',
      } as any);

      expect(tokenDoc.save).toHaveBeenCalled();
      expect(mailService.sendEmail).toHaveBeenCalled();
      expect(result).toBe(
        'Se ha enviado al email las instrucciones para recuperar la contraseña',
      );
    });

    it('lanza NotFound si el usuario no existe', async () => {
      userService.findUserByEmail.mockResolvedValue(null);

      await expect(
        service.forgotPassword({ email: 'no@test.com' } as any),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('validateToken', () => {
    it('retorna mensaje cuando el token es válido', async () => {
      tokenService.findOneByToken.mockResolvedValue({
        type: TOKEN_TYPE.PASSWORD_RESET,
      });

      await expect(
        service.validateToken({ token: '123456' } as any),
      ).resolves.toBe('Token validado correctamente');
    });

    it('lanza NotFound si el token no existe', async () => {
      tokenService.findOneByToken.mockResolvedValue(null);

      await expect(
        service.validateToken({ token: '123456' } as any),
      ).rejects.toThrow(TOKEN_MESSAGES.TOKEN_NOT_FOUND);
    });

    it('lanza BadRequest si el token no es de reset', async () => {
      tokenService.findOneByToken.mockResolvedValue({
        type: TOKEN_TYPE.CONFIRMATION,
      });

      await expect(
        service.validateToken({ token: '123456' } as any),
      ).rejects.toThrow(TOKEN_MESSAGES.TOKEN_INVALID);
    });
  });

  describe('updatePassword', () => {
    it('hashea la nueva contraseña, guarda y elimina el token', async () => {
      const token = {
        type: TOKEN_TYPE.PASSWORD_RESET,
        userId: VALID_ID,
        deleteOne: jest.fn().mockResolvedValue({}),
      };
      tokenService.findOneByToken.mockResolvedValue(token);
      const user = buildUser();
      userService.findOne.mockResolvedValue(user);

      const result = await service.updatePassword(
        {
          newPassword: 'NewSecret1#',
          confirmNewPassword: 'NewSecret1#',
        } as any,
        '123456',
      );

      expect(encryption.hash).toHaveBeenCalledWith('NewSecret1#');
      expect(user.password).toBe('hashed');
      expect(user.save).toHaveBeenCalled();
      expect(token.deleteOne).toHaveBeenCalled();
      expect(result).toBe('Se ha cambiado la contraseña correctamente');
    });

    it('lanza BadRequest si el token es inválido', async () => {
      tokenService.findOneByToken.mockResolvedValue(null);

      await expect(
        service.updatePassword(
          { newPassword: 'NewSecret1#', confirmNewPassword: 'NewSecret1#' } as any,
          '000000',
        ),
      ).rejects.toThrow(TOKEN_MESSAGES.TOKEN_NOT_FOUND);
    });
  });

  describe('findAndValidateUserExistAndActive', () => {
    it('busca por id cuando el término es un ObjectId', async () => {
      const user = buildUser();
      userService.findOne.mockResolvedValue(user);

      await expect(
        service.findAndValidateUserExistAndActive(VALID_ID),
      ).resolves.toBe(user);
      expect(userService.findOne).toHaveBeenCalledWith(VALID_ID);
    });

    it('busca por email cuando el término no es un ObjectId', async () => {
      userService.findUserByEmail.mockResolvedValue(buildUser());

      await service.findAndValidateUserExistAndActive('user@test.com');

      expect(userService.findUserByEmail).toHaveBeenCalledWith('user@test.com');
    });

    it('lanza NotFound si el usuario no existe', async () => {
      userService.findUserByEmail.mockResolvedValue(null);

      await expect(
        service.findAndValidateUserExistAndActive('no@test.com'),
      ).rejects.toThrow(NotFoundException);
    });

    it('lanza NotFound si el usuario está eliminado', async () => {
      userService.findUserByEmail.mockResolvedValue(
        buildUser({ isDeleted: true }),
      );

      await expect(
        service.findAndValidateUserExistAndActive('user@test.com'),
      ).rejects.toThrow(USER_VALIDATION_MESSAGES.USER_NOT_FOUND);
    });

    it('lanza BadRequest si el usuario está inactivo', async () => {
      userService.findUserByEmail.mockResolvedValue(
        buildUser({ isActive: false }),
      );

      await expect(
        service.findAndValidateUserExistAndActive('user@test.com'),
      ).rejects.toThrow(USER_VALIDATION_MESSAGES.USER_INACTIVE);
    });
  });
});
