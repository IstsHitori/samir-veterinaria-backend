import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import { USER_VALIDATION_MESSAGES } from './constants';

const VALID_ID = '507f1f77bcf86cd799439011';

const buildUser = (overrides: Record<string, any> = {}): any => ({
  _id: VALID_ID,
  email: 'user@test.com',
  isActive: true,
  isDeleted: false,
  save: jest.fn().mockResolvedValue(true),
  updateOne: jest.fn().mockResolvedValue({}),
  ...overrides,
});

describe('UserService', () => {
  let userModel: any;
  let authService: any;
  let service: UserService;

  beforeEach(() => {
    userModel = {
      find: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
    };
    authService = { findAndValidateUserExistAndActive: jest.fn() };
    service = new UserService(userModel, authService);
  });

  describe('findAll', () => {
    it('excluye al propio usuario y los eliminados, y no expone password', async () => {
      const select = jest.fn().mockResolvedValue([{ _id: 'otro' }]);
      userModel.find.mockReturnValue({ select });

      const result = await service.findAll(VALID_ID);

      expect(userModel.find).toHaveBeenCalledWith({
        _id: { $ne: VALID_ID },
        isDeleted: false,
      });
      expect(select).toHaveBeenCalledWith('-password -__v');
      expect(result).toEqual([{ _id: 'otro' }]);
    });
  });

  describe('findOne', () => {
    it('lanza BadRequest si el id no es un ObjectId válido', async () => {
      await expect(service.findOne('no-es-id')).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.findOne('no-es-id')).rejects.toThrow(
        USER_VALIDATION_MESSAGES.ID_USER_NOT_VALID,
      );
      expect(userModel.findById).not.toHaveBeenCalled();
    });

    it('lanza NotFound si el usuario no existe', async () => {
      userModel.findById.mockResolvedValue(null);

      await expect(service.findOne(VALID_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('retorna el usuario cuando existe', async () => {
      const user = buildUser();
      userModel.findById.mockResolvedValue(user);

      await expect(service.findOne(VALID_ID)).resolves.toBe(user);
    });
  });

  describe('update', () => {
    it('valida la existencia del usuario y actualiza', async () => {
      const user = buildUser();
      authService.findAndValidateUserExistAndActive.mockResolvedValue(user);

      const result = await service.update(VALID_ID, {
        firstName: 'Nuevo',
      } as any);

      expect(authService.findAndValidateUserExistAndActive).toHaveBeenCalledWith(
        VALID_ID,
      );
      expect(user.updateOne).toHaveBeenCalledWith({ firstName: 'Nuevo' });
      expect(result).toBe('Perfil actualizado');
    });
  });

  describe('remove', () => {
    it('marca al usuario como eliminado e inactivo', async () => {
      const user = buildUser();
      userModel.findById.mockResolvedValue(user);

      const result = await service.remove(VALID_ID);

      expect(user.isActive).toBe(false);
      expect(user.isDeleted).toBe(true);
      expect(user.deletedAt).toBeInstanceOf(Date);
      expect(user.save).toHaveBeenCalled();
      expect(result).toBe('Se ha eliminado el usuario');
    });

    it('lanza NotFound si el usuario ya estaba eliminado', async () => {
      userModel.findById.mockResolvedValue(buildUser({ isDeleted: true }));

      await expect(service.remove(VALID_ID)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findUserByEmail', () => {
    it('busca al usuario por email', async () => {
      userModel.findOne.mockResolvedValue({ email: 'a@a.com' });

      await expect(service.findUserByEmail('a@a.com')).resolves.toEqual({
        email: 'a@a.com',
      });
      expect(userModel.findOne).toHaveBeenCalledWith({ email: 'a@a.com' });
    });
  });

  describe('desactivateUser / activateUser', () => {
    it('desactiva un usuario existente', async () => {
      const user = buildUser();
      userModel.findById.mockResolvedValue(user);

      const result = await service.desactivateUser(VALID_ID);

      expect(user.isActive).toBe(false);
      expect(user.save).toHaveBeenCalled();
      expect(result).toBe('Se ha desactivado el usuario');
    });

    it('activa un usuario existente', async () => {
      const user = buildUser({ isActive: false });
      userModel.findById.mockResolvedValue(user);

      const result = await service.activateUser(VALID_ID);

      expect(user.isActive).toBe(true);
      expect(user.save).toHaveBeenCalled();
      expect(result).toBe('Se ha activado el usuario');
    });
  });
});
