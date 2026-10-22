import { Logger } from '@nestjs/common';
import { Role } from 'src/user/constants';
import { AdminSeedService, SEED_MESSAGES } from './admin-seed.service';

const buildUser = (overrides: Record<string, any> = {}): any => ({
  email: 'admin@veterinaria.com',
  firstName: 'Nombre',
  lastName: 'Anterior',
  password: 'old-hashed-password',
  role: Role.ADMIN as Role,
  isActive: false,
  isDeleted: true,
  deletedAt: new Date(),
  save: jest.fn().mockResolvedValue(true),
  ...overrides,
});

const CONFIG_VALUES: Record<string, string | undefined> = {
  SEED_ADMIN_EMAIL: 'admin@veterinaria.com',
  SEED_ADMIN_PASSWORD: 'VetAdmin2026#',
  SEED_ADMIN_FIRST_NAME: 'Samir',
  SEED_ADMIN_LAST_NAME: 'Administrador',
};

describe('AdminSeedService', () => {
  let userModel: any;
  let encryption: any;
  let configService: any;
  let service: AdminSeedService;

  beforeEach(() => {
    userModel = {
      findOne: jest.fn(),
      create: jest.fn().mockResolvedValue({}),
    };
    encryption = {
      hash: jest.fn().mockResolvedValue('hashed-password'),
      compare: jest.fn(),
    };
    configService = {
      get: jest.fn((key: string) => CONFIG_VALUES[key]),
    };
    service = new AdminSeedService(userModel, encryption, configService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('seed', () => {
    it('no crea nada cuando ya existe un administrador activo', async () => {
      userModel.findOne.mockResolvedValue(
        buildUser({ isDeleted: false, isActive: true }),
      );

      await service.seed();

      expect(userModel.findOne).toHaveBeenCalledWith({
        role: Role.ADMIN,
        isDeleted: false,
        isActive: true,
      });
      expect(encryption.hash).not.toHaveBeenCalled();
      expect(userModel.create).not.toHaveBeenCalled();
    });

    it('crea el administrador cuando no existe ninguno', async () => {
      userModel.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

      await service.seed();

      expect(encryption.hash).toHaveBeenCalledWith('VetAdmin2026#');
      expect(userModel.create).toHaveBeenCalledWith({
        firstName: 'Samir',
        lastName: 'Administrador',
        email: 'admin@veterinaria.com',
        password: 'hashed-password',
        role: Role.ADMIN,
        isActive: true,
        isDeleted: false,
        deletedAt: null,
      });
    });

    it('usa nombres por defecto y normaliza el email a minúsculas', async () => {
      configService.get.mockImplementation(
        (key: string) =>
          ({
            SEED_ADMIN_EMAIL: '  Admin@Veterinaria.COM ',
            SEED_ADMIN_PASSWORD: 'VetAdmin2026#',
          })[key],
      );
      userModel.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);

      await service.seed();

      expect(userModel.create).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'Admin',
          lastName: 'Sistema',
          email: 'admin@veterinaria.com',
        }),
      );
    });

    it('falla si falta SEED_ADMIN_EMAIL', async () => {
      configService.get.mockImplementation((key: string) =>
        key === 'SEED_ADMIN_EMAIL' ? undefined : CONFIG_VALUES[key],
      );
      userModel.findOne.mockResolvedValueOnce(null);

      await expect(service.seed()).rejects.toThrow(SEED_MESSAGES.EMAIL_MISSING);
      expect(userModel.create).not.toHaveBeenCalled();
    });

    it('falla si el email no tiene formato válido', async () => {
      configService.get.mockImplementation((key: string) =>
        key === 'SEED_ADMIN_EMAIL' ? 'admin-sin-arroba' : CONFIG_VALUES[key],
      );
      userModel.findOne.mockResolvedValueOnce(null);

      await expect(service.seed()).rejects.toThrow(SEED_MESSAGES.EMAIL_INVALID);
      expect(userModel.create).not.toHaveBeenCalled();
    });

    it('falla si falta SEED_ADMIN_PASSWORD', async () => {
      configService.get.mockImplementation((key: string) =>
        key === 'SEED_ADMIN_PASSWORD' ? undefined : CONFIG_VALUES[key],
      );
      userModel.findOne.mockResolvedValueOnce(null);

      await expect(service.seed()).rejects.toThrow(
        SEED_MESSAGES.PASSWORD_MISSING,
      );
    });

    it('falla si la password no cumple la complejidad', async () => {
      configService.get.mockImplementation((key: string) =>
        key === 'SEED_ADMIN_PASSWORD' ? 'debil' : CONFIG_VALUES[key],
      );
      userModel.findOne.mockResolvedValueOnce(null);

      await expect(service.seed()).rejects.toThrow(SEED_MESSAGES.PASSWORD_WEAK);
      expect(userModel.create).not.toHaveBeenCalled();
    });

    it('no promueve a administrador un email usado por otro rol', async () => {
      userModel.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(buildUser({ role: Role.VETERINARY }));

      await expect(service.seed()).rejects.toThrow(
        SEED_MESSAGES.EMAIL_TAKEN_BY_OTHER_ROLE,
      );
      expect(userModel.create).not.toHaveBeenCalled();
    });

    it('restaura el administrador soft-deleted con el mismo email', async () => {
      const deletedAdmin = buildUser();
      userModel.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(deletedAdmin);

      await service.seed();

      expect(deletedAdmin.firstName).toBe('Samir');
      expect(deletedAdmin.lastName).toBe('Administrador');
      expect(deletedAdmin.password).toBe('hashed-password');
      expect(deletedAdmin.isActive).toBe(true);
      expect(deletedAdmin.isDeleted).toBe(false);
      expect(deletedAdmin.deletedAt).toBeNull();
      expect(deletedAdmin.save).toHaveBeenCalled();
      expect(userModel.create).not.toHaveBeenCalled();
    });

    it('reactiva el administrador con el mismo email si estaba inactivo', async () => {
      const inactiveAdmin = buildUser({ isDeleted: false, isActive: false });
      userModel.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(inactiveAdmin);

      await service.seed();

      expect(inactiveAdmin.isActive).toBe(true);
      expect(inactiveAdmin.isDeleted).toBe(false);
      expect(inactiveAdmin.save).toHaveBeenCalled();
      expect(userModel.create).not.toHaveBeenCalled();
    });

    it('no crea un duplicado si la creación choca con el índice único', async () => {
      userModel.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(null);
      userModel.create.mockRejectedValue({ code: 11000 });

      await expect(service.seed()).resolves.toBeUndefined();
    });
  });

  describe('onApplicationBootstrap', () => {
    it('loguea el error y no tumba el arranque de la app', async () => {
      const errorSpy = jest
        .spyOn(Logger.prototype, 'error')
        .mockImplementation(() => undefined);
      userModel.findOne.mockRejectedValue(new Error('mongo caído'));

      await expect(service.onApplicationBootstrap()).resolves.toBeUndefined();

      expect(errorSpy).toHaveBeenCalledWith(
        expect.stringContaining('mongo caído'),
      );
    });
  });
});
