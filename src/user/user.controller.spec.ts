import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let userService: Record<string, jest.Mock>;
  let controller: UserController;

  beforeEach(() => {
    userService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      desactivateUser: jest.fn(),
      activateUser: jest.fn(),
      remove: jest.fn(),
    };
    controller = new UserController(userService as unknown as UserService);
  });

  it('findAll retorna los usuarios envueltos y excluye al solicitante', async () => {
    userService.findAll.mockResolvedValue([{ _id: '2' }]);

    await expect(controller.findAll('user-1')).resolves.toEqual({
      users: [{ _id: '2' }],
    });
    expect(userService.findAll).toHaveBeenCalledWith('user-1');
  });

  it('findOne delega en el servicio', async () => {
    userService.findOne.mockResolvedValue({ _id: '2' });

    await controller.findOne('2');

    expect(userService.findOne).toHaveBeenCalledWith('2');
  });

  it('update delega id y dto', async () => {
    const dto = { firstName: 'X' } as any;

    await controller.update('2', dto);

    expect(userService.update).toHaveBeenCalledWith('2', dto);
  });

  it('desactivateUser delega en el servicio', async () => {
    await controller.desactivateUser('2');

    expect(userService.desactivateUser).toHaveBeenCalledWith('2');
  });

  it('activateUser delega en el servicio', async () => {
    await controller.activateUser('2');

    expect(userService.activateUser).toHaveBeenCalledWith('2');
  });

  it('remove delega en el servicio', async () => {
    await controller.remove('2');

    expect(userService.remove).toHaveBeenCalledWith('2');
  });
});
