import { OwnerController } from './owner.controller';
import { OwnerService } from './owner.service';

describe('OwnerController', () => {
  let ownerService: Record<string, jest.Mock>;
  let controller: OwnerController;

  beforeEach(() => {
    ownerService = {
      create: jest.fn(),
      findAll: jest.fn(),
      findAllOwnersWithPatients: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    controller = new OwnerController(ownerService as unknown as OwnerService);
  });

  it('create delega en el servicio', async () => {
    const dto = { name: 'Ana' } as any;
    ownerService.create.mockResolvedValue({ ownerId: '1' });

    await expect(controller.create(dto)).resolves.toEqual({ ownerId: '1' });
    expect(ownerService.create).toHaveBeenCalledWith(dto);
  });

  it('findAll retorna los dueños envueltos', async () => {
    ownerService.findAll.mockResolvedValue([{ _id: '1' }]);

    await expect(controller.findAll()).resolves.toEqual({
      owners: [{ _id: '1' }],
    });
  });

  it('findAllOwnersWithPets retorna dueños con mascotas', async () => {
    ownerService.findAllOwnersWithPatients.mockResolvedValue([{ _id: '1' }]);

    await expect(controller.findAllOwnersWithPets()).resolves.toEqual({
      owners: [{ _id: '1' }],
    });
  });

  it('findOne delega en el servicio', async () => {
    await controller.findOne('1');

    expect(ownerService.findOne).toHaveBeenCalledWith('1');
  });

  it('update delega id y dto', async () => {
    const dto = { name: 'X' } as any;

    await controller.update('1', dto);

    expect(ownerService.update).toHaveBeenCalledWith('1', dto);
  });

  it('remove delega en el servicio', async () => {
    await controller.remove('1');

    expect(ownerService.remove).toHaveBeenCalledWith('1');
  });
});
