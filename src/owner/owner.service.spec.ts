import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OwnerService } from './owner.service';
import { OWNER_MESSAGES } from './constants/owner-messages';

const VALID_ID = '507f1f77bcf86cd799439011';

const buildOwner = (overrides: Record<string, any> = {}): any => ({
  _id: VALID_ID,
  name: 'Ana',
  document: '123456',
  address: 'Calle 1',
  email: 'owner@test.com',
  telephone: '3001234567',
  isDeleted: false,
  save: jest.fn().mockResolvedValue(true),
  updateOne: jest.fn().mockResolvedValue({}),
  ...overrides,
});

const validDto = {
  name: 'Ana',
  document: '123456',
  address: 'Calle 1',
  email: 'owner@test.com',
  telephone: '3001234567',
};

describe('OwnerService', () => {
  let ownerModel: any;
  let service: OwnerService;

  beforeEach(() => {
    ownerModel = {
      create: jest.fn(),
      find: jest.fn(),
      findById: jest.fn(),
      findOne: jest.fn(),
      aggregate: jest.fn(),
    };
    service = new OwnerService(ownerModel);
  });

  describe('create', () => {
    it('crea el dueño cuando email y documento no existen', async () => {
      ownerModel.findOne
        .mockResolvedValueOnce(null) // por email
        .mockResolvedValueOnce(null); // por documento
      ownerModel.create.mockResolvedValue({ _id: 'owner-1' });

      const result = await service.create(validDto as any);

      expect(ownerModel.create).toHaveBeenCalledWith(validDto);
      expect(result).toEqual({ ownerId: 'owner-1', message: 'Dueño creado' });
    });

    it('lanza BadRequest si el email ya existe', async () => {
      ownerModel.findOne.mockResolvedValueOnce(buildOwner());

      await expect(service.create(validDto as any)).rejects.toThrow(
        OWNER_MESSAGES.OWNER_EMAIL_EXIST,
      );
      expect(ownerModel.create).not.toHaveBeenCalled();
    });

    it('lanza BadRequest si el documento ya existe', async () => {
      ownerModel.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(buildOwner());

      await expect(service.create(validDto as any)).rejects.toThrow(
        OWNER_MESSAGES.OWNER_DOCUMENT_EXIST,
      );
    });
  });

  describe('findAll', () => {
    it('retorna los dueños no eliminados y sin campos internos', async () => {
      const select = jest.fn().mockResolvedValue([{ _id: '1' }]);
      ownerModel.find.mockReturnValue({ select });

      await expect(service.findAll()).resolves.toEqual([{ _id: '1' }]);
      expect(ownerModel.find).toHaveBeenCalledWith({ isDeleted: false });
      expect(select).toHaveBeenCalledWith('-__v -isDeleted -deletedAt');
    });
  });

  describe('findAllOwnersWithPatients', () => {
    it('ejecuta el aggregate', async () => {
      const aggregated = [{ _id: '1', patients: [] }];
      ownerModel.aggregate.mockResolvedValue(aggregated);

      await expect(service.findAllOwnersWithPatients()).resolves.toBe(
        aggregated,
      );
      expect(ownerModel.aggregate).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('lanza BadRequest si el id no es válido', async () => {
      await expect(service.findOne('bad-id')).rejects.toThrow(
        OWNER_MESSAGES.ID_WONER_NOT_VALID,
      );
    });

    it('lanza NotFound si no existe', async () => {
      ownerModel.findById.mockResolvedValue(null);

      await expect(service.findOne(VALID_ID)).rejects.toThrow(NotFoundException);
    });

    it('lanza NotFound si está eliminado', async () => {
      ownerModel.findById.mockResolvedValue(buildOwner({ isDeleted: true }));

      await expect(service.findOne(VALID_ID)).rejects.toThrow(NotFoundException);
    });

    it('retorna el dueño cuando existe', async () => {
      const owner = buildOwner();
      ownerModel.findById.mockResolvedValue(owner);

      await expect(service.findOne(VALID_ID)).resolves.toBe(owner);
    });
  });

  describe('update', () => {
    it('actualiza cuando el email y documento no cambian', async () => {
      const owner = buildOwner();
      ownerModel.findById.mockResolvedValue(owner);

      const result = await service.update(VALID_ID, { name: 'Nuevo' } as any);

      expect(owner.updateOne).toHaveBeenCalledWith({ name: 'Nuevo' });
      expect(result).toBe('Se acutalizó el dueño');
    });

    it('lanza BadRequest si el nuevo email ya está en uso por otro dueño', async () => {
      const owner = buildOwner();
      ownerModel.findById.mockResolvedValue(owner);
      ownerModel.findOne.mockResolvedValue(
        buildOwner({ _id: 'otro-id', email: 'nuevo@test.com' }),
      );

      await expect(
        service.update(VALID_ID, { email: 'nuevo@test.com' } as any),
      ).rejects.toThrow(OWNER_MESSAGES.EMAIL_UNIQUE);
    });

    it('lanza BadRequest si el nuevo documento ya está en uso por otro dueño', async () => {
      const owner = buildOwner();
      ownerModel.findById.mockResolvedValue(owner);
      ownerModel.findOne.mockResolvedValue(
        buildOwner({ _id: 'otro-id', document: '999999' }),
      );

      await expect(
        service.update(VALID_ID, { document: '999999' } as any),
      ).rejects.toThrow(OWNER_MESSAGES.DOCUMENT_UNIQUE);
    });
  });

  describe('remove', () => {
    it('marca al dueño como eliminado', async () => {
      const owner = buildOwner();
      ownerModel.findById.mockResolvedValue(owner);

      const result = await service.remove(VALID_ID);

      expect(owner.isDeleted).toBe(true);
      expect(owner.deletedAt).toBeInstanceOf(Date);
      expect(owner.save).toHaveBeenCalled();
      expect(result).toBe('Se eliminó el dueño');
    });
  });
});
