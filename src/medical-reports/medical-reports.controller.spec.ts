import { MedicalReportsController } from './medical-reports.controller';
import { MedicalReportsService } from './medical-reports.service';

describe('MedicalReportsController', () => {
  let service: Record<string, jest.Mock>;
  let controller: MedicalReportsController;

  beforeEach(() => {
    service = {
      create: jest.fn(),
      findAllByPatient: jest.fn(),
      findAllByIdPatient: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    controller = new MedicalReportsController(
      service as unknown as MedicalReportsService,
    );
  });

  it('create delega el dto y el usuario', async () => {
    const dto = { patientId: 'p1', details: 'x' } as any;

    await controller.create(dto, 'user-1');

    expect(service.create).toHaveBeenCalledWith(dto, 'user-1');
  });

  it('findAll retorna los reportes agrupados envueltos', async () => {
    service.findAllByPatient.mockResolvedValue([{ patient: 'p1' }]);

    await expect(controller.findAll()).resolves.toEqual({
      reports: [{ patient: 'p1' }],
    });
  });

  it('findPatientReports delega el id del paciente', async () => {
    await controller.findPatientReports('p1');

    expect(service.findAllByIdPatient).toHaveBeenCalledWith('p1');
  });

  it('findOne delega en el servicio', async () => {
    await controller.findOne('1');

    expect(service.findOne).toHaveBeenCalledWith('1');
  });

  it('update delega id, dto y usuario', async () => {
    const dto = { details: 'x' } as any;

    await controller.update('1', dto, 'user-1');

    expect(service.update).toHaveBeenCalledWith('1', dto, 'user-1');
  });

  it('remove delega en el servicio', async () => {
    await controller.remove('1');

    expect(service.remove).toHaveBeenCalledWith('1');
  });
});
