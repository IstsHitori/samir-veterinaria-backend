import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';

describe('PatientController', () => {
  let patientService: Record<string, jest.Mock>;
  let controller: PatientController;

  beforeEach(() => {
    patientService = {
      create: jest.fn(),
      findAll: jest.fn(),
      getMyPatients: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      desactivatePatient: jest.fn(),
      activatePatient: jest.fn(),
      remove: jest.fn(),
    };
    controller = new PatientController(
      patientService as unknown as PatientService,
    );
  });

  it('create delega el usuario que registra y el dto', async () => {
    const dto = { name: 'Firulais' } as any;

    await controller.create('user-1', dto);

    expect(patientService.create).toHaveBeenCalledWith('user-1', dto);
  });

  it('findAll retorna los pacientes envueltos', async () => {
    patientService.findAll.mockResolvedValue([{ _id: '1' }]);

    await expect(controller.findAll()).resolves.toEqual({
      patients: [{ _id: '1' }],
    });
  });

  it('getMyPatients delega el usuario', async () => {
    await controller.getMyPatients('user-1');

    expect(patientService.getMyPatients).toHaveBeenCalledWith('user-1');
  });

  it('findOne delega en el servicio', async () => {
    await controller.findOne('1');

    expect(patientService.findOne).toHaveBeenCalledWith('1');
  });

  it('update delega id y dto', async () => {
    const dto = { name: 'X' } as any;

    await controller.update('1', dto);

    expect(patientService.update).toHaveBeenCalledWith('1', dto);
  });

  it('desactivatePatient delega en el servicio', async () => {
    await controller.desactivatePatient('1');

    expect(patientService.desactivatePatient).toHaveBeenCalledWith('1');
  });

  it('activatePatient delega en el servicio', async () => {
    await controller.activatePatient('1');

    expect(patientService.activatePatient).toHaveBeenCalledWith('1');
  });

  it('remove delega el usuario que elimina y el id', async () => {
    await controller.remove('user-1', '1');

    expect(patientService.remove).toHaveBeenCalledWith('user-1', '1');
  });
});
