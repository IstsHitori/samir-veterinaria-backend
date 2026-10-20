import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PatientService } from './patient.service';
import { PATIENT_MESSAGES } from './constants/patient-messages';

const VALID_ID = '507f1f77bcf86cd799439011';
const OWNER_ID = '507f191e810c19729de860ea';

const chain = (final: any) => {
  const q: any = {};
  q.select = jest.fn(() => q);
  q.populate = jest.fn(() => q);
  q.exec = jest.fn().mockResolvedValue(final);
  return q;
};

const buildPatient = (overrides: Record<string, any> = {}): any => ({
  _id: VALID_ID,
  name: 'Firulais',
  isActive: true,
  isDeleted: false,
  save: jest.fn().mockResolvedValue(true),
  updateOne: jest.fn().mockResolvedValue({}),
  ...overrides,
});

const validDto = {
  name: 'Firulais',
  type: 'perro',
  breed: 'Labrador',
  birthDate: new Date('2020-01-01'),
  gender: 'masculino',
  weight: '20',
  size: 'mediano',
  ownerId: OWNER_ID,
};

describe('PatientService', () => {
  let patientModel: any;
  let ownerService: any;
  let medicalReportModel: any;
  let service: PatientService;

  beforeEach(() => {
    patientModel = jest.fn(() => buildPatient());
    patientModel.find = jest.fn();
    patientModel.findById = jest.fn();
    ownerService = { findOne: jest.fn() };
    medicalReportModel = { create: jest.fn().mockResolvedValue({}) };
    service = new PatientService(
      patientModel,
      ownerService,
      medicalReportModel,
    );
  });

  describe('create', () => {
    it('valida el dueño, asigna registeredBy y guarda', async () => {
      ownerService.findOne.mockResolvedValue({ _id: OWNER_ID });
      const patient = buildPatient();
      patientModel.mockReturnValue(patient);

      const result = await service.create('user-1', validDto as any);

      expect(ownerService.findOne).toHaveBeenCalledWith(OWNER_ID);
      expect(patient.registeredBy).toBe('user-1');
      expect(patient.save).toHaveBeenCalled();
      expect(result).toEqual({
        message: 'Paciente registrado',
        patientId: VALID_ID,
      });
      expect(medicalReportModel.create).not.toHaveBeenCalled();
    });

    it('crea el primer reporte clínico cuando se envía historia', async () => {
      ownerService.findOne.mockResolvedValue({ _id: OWNER_ID });
      const patient = buildPatient();
      patientModel.mockReturnValue(patient);

      await service.create('user-1', {
        ...validDto,
        history: '  Convive con dos gatos  ',
      } as any);

      expect(medicalReportModel.create).toHaveBeenCalledWith({
        userId: 'user-1',
        patientId: VALID_ID,
        details: 'Convive con dos gatos',
      });
    });

    it('propaga el error cuando el dueño no existe', async () => {
      ownerService.findOne.mockRejectedValue(
        new NotFoundException(PATIENT_MESSAGES.OWNER_NOT_FOUND),
      );

      await expect(service.create('user-1', validDto as any)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('lanza OWNER_NOT_FOUND si el servicio de dueños retorna vacío', async () => {
      ownerService.findOne.mockResolvedValue(null);

      await expect(service.create('user-1', validDto as any)).rejects.toThrow(
        PATIENT_MESSAGES.OWNER_NOT_FOUND,
      );
    });
  });

  describe('findAll', () => {
    it('retorna los pacientes no eliminados con populate', async () => {
      const patients = [{ _id: '1' }];
      patientModel.find.mockReturnValue(chain(patients));

      await expect(service.findAll()).resolves.toBe(patients);
      expect(patientModel.find).toHaveBeenCalledWith({ isDeleted: false });
    });
  });

  describe('getMyPatients', () => {
    it('filtra por registeredBy y no eliminados', async () => {
      const mine = [{ _id: '1' }];
      patientModel.find.mockResolvedValue(mine);

      await expect(service.getMyPatients('user-1')).resolves.toBe(mine);
      expect(patientModel.find).toHaveBeenCalledWith({
        registeredBy: 'user-1',
        isDeleted: false,
      });
    });
  });

  describe('findOne', () => {
    it('lanza BadRequest si el id no es válido', async () => {
      await expect(service.findOne('bad-id')).rejects.toThrow(
        PATIENT_MESSAGES.ID_PATIENT_NOT_VALID,
      );
    });

    it('lanza NotFound si no existe', async () => {
      patientModel.findById.mockReturnValue(chain(null));

      await expect(service.findOne(VALID_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('lanza NotFound si está eliminado', async () => {
      patientModel.findById.mockReturnValue(
        chain(buildPatient({ isDeleted: true })),
      );

      await expect(service.findOne(VALID_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('retorna el paciente cuando existe', async () => {
      const patient = buildPatient();
      patientModel.findById.mockReturnValue(chain(patient));

      await expect(service.findOne(VALID_ID)).resolves.toBe(patient);
    });
  });

  describe('findSimpleOneById', () => {
    it('lanza NotFound si no existe', async () => {
      patientModel.findById.mockResolvedValue(null);

      await expect(service.findSimpleOneById(VALID_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('retorna el paciente si existe', async () => {
      const patient = buildPatient();
      patientModel.findById.mockResolvedValue(patient);

      await expect(service.findSimpleOneById(VALID_ID)).resolves.toBe(patient);
    });
  });

  describe('update', () => {
    it('actualiza un paciente existente', async () => {
      const patient = buildPatient();
      patientModel.findById.mockReturnValue(chain(patient));

      const result = await service.update(VALID_ID, { name: 'Nuevo' } as any);

      expect(patient.updateOne).toHaveBeenCalledWith({ name: 'Nuevo' });
      expect(result).toBe('Paciente actualizado');
    });
  });

  describe('desactivatePatient / activatePatient', () => {
    it('desactiva el paciente', async () => {
      const patient = buildPatient();
      patientModel.findById.mockReturnValue(chain(patient));

      const result = await service.desactivatePatient(VALID_ID);

      expect(patient.isActive).toBe(false);
      expect(result).toBe('Paciente desactivado');
    });

    it('activa el paciente', async () => {
      const patient = buildPatient({ isActive: false });
      patientModel.findById.mockReturnValue(chain(patient));

      const result = await service.activatePatient(VALID_ID);

      expect(patient.isActive).toBe(true);
      expect(result).toBe('Paciente activado');
    });
  });

  describe('remove', () => {
    it('marca el paciente como eliminado y registra quién lo eliminó', async () => {
      const patient = buildPatient();
      patientModel.findById.mockReturnValue(chain(patient));

      const result = await service.remove('user-9', VALID_ID);

      expect(patient.isDeleted).toBe(true);
      expect(patient.isActive).toBe(false);
      expect(patient.deletedBy).toBe('user-9');
      expect(patient.deletedAt).toBeInstanceOf(Date);
      expect(patient.save).toHaveBeenCalled();
      expect(result).toBe('Paciente eliminado');
    });
  });
});
