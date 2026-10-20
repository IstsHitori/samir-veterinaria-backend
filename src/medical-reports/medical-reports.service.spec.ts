import { BadRequestException, NotFoundException } from '@nestjs/common';
import { MedicalReportsService } from './medical-reports.service';
import { MEDICAL_REPORTS_MESSAGES } from './constants/medical-report-messages';

const VALID_ID = '507f1f77bcf86cd799439011';
const PATIENT_ID = '507f191e810c19729de860ea';
const USER_ID = '507f191e810c19729de860eb';

const chain = (final: any) => {
  const q: any = {};
  q.select = jest.fn(() => q);
  q.populate = jest.fn(() => q);
  q.sort = jest.fn(() => q);
  q.exec = jest.fn().mockResolvedValue(final);
  q.then = (resolve: any) => resolve(final);
  return q;
};

const buildReport = (overrides: Record<string, any> = {}) => ({
  _id: VALID_ID,
  details: 'Control anual',
  save: jest.fn().mockResolvedValue(true),
  updateOne: jest.fn().mockResolvedValue({}),
  deleteOne: jest.fn().mockResolvedValue({}),
  ...overrides,
});

describe('MedicalReportsService', () => {
  let reportModel: any;
  let userService: any;
  let patientService: any;
  let service: MedicalReportsService;

  beforeEach(() => {
    reportModel = jest.fn(() => buildReport());
    reportModel.find = jest.fn();
    reportModel.findById = jest.fn();
    userService = { findOne: jest.fn() };
    patientService = {
      findSimpleOneById: jest.fn(),
      findOne: jest.fn(),
    };
    service = new MedicalReportsService(
      reportModel,
      userService,
      patientService,
    );
  });

  describe('create', () => {
    it('valida usuario y paciente, asigna userId y guarda', async () => {
      userService.findOne.mockResolvedValue({ _id: USER_ID });
      patientService.findSimpleOneById.mockResolvedValue({ _id: PATIENT_ID });
      const report = buildReport();
      reportModel.mockReturnValue(report);

      const result = await service.create(
        { patientId: PATIENT_ID, details: 'x' } as any,
        USER_ID,
      );

      expect(userService.findOne).toHaveBeenCalledWith(USER_ID);
      expect(patientService.findSimpleOneById).toHaveBeenCalledWith(PATIENT_ID);
      expect(report.save).toHaveBeenCalled();
      expect(result).toBe('Reporte médico creado');
    });

    it('propaga el error si el paciente no existe', async () => {
      userService.findOne.mockResolvedValue({ _id: USER_ID });
      patientService.findSimpleOneById.mockRejectedValue(
        new NotFoundException(),
      );

      await expect(
        service.create({ patientId: PATIENT_ID, details: 'x' } as any, USER_ID),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAllByPatient', () => {
    it('agrupa los reportes por paciente', async () => {
      const patient = { _id: { toString: () => PATIENT_ID }, name: 'Firulais' };
      const user = { _id: USER_ID, firstName: 'Vet' };
      const reports = [
        {
          _id: { toString: () => 'r1' },
          details: 'A',
          createdAt: new Date(),
          updatedAt: new Date(),
          patientId: patient,
          userId: user,
        },
        {
          _id: { toString: () => 'r2' },
          details: 'B',
          createdAt: new Date(),
          updatedAt: new Date(),
          patientId: patient,
          userId: user,
        },
      ];
      reportModel.find.mockReturnValue(chain(reports));

      const result = await service.findAllByPatient();

      expect(result).toHaveLength(1);
      expect(result[0].patient).toBe(patient);
      expect(result[0].reports).toHaveLength(2);
      expect(result[0].reports.map((r: any) => r.details)).toEqual(['A', 'B']);
    });

    it('crea un grupo por cada paciente distinto', async () => {
      const p1 = { _id: { toString: () => PATIENT_ID } };
      const p2 = { _id: { toString: () => 'otro-paciente' } };
      const base = {
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: {},
      };
      reportModel.find.mockReturnValue(
        chain([
          { ...base, _id: { toString: () => 'r1' }, details: 'A', patientId: p1 },
          { ...base, _id: { toString: () => 'r2' }, details: 'B', patientId: p2 },
        ]),
      );

      const result = await service.findAllByPatient();

      expect(result).toHaveLength(2);
    });
  });

  describe('findAllByIdPatient', () => {
    it('valida el paciente y busca sus reportes', async () => {
      patientService.findOne.mockResolvedValue({ _id: PATIENT_ID });
      const reports = [{ _id: 'r1' }];
      const query = chain(reports);
      reportModel.find.mockReturnValue(query);

      const result = await service.findAllByIdPatient(PATIENT_ID);

      expect(patientService.findOne).toHaveBeenCalledWith(PATIENT_ID);
      expect(reportModel.find).toHaveBeenCalledWith({ patientId: PATIENT_ID });
      expect(query.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(result).toBe(reports);
    });
  });

  describe('findOne', () => {
    it('lanza BadRequest si el id no es válido', async () => {
      await expect(service.findOne('bad-id')).rejects.toThrow(
        MEDICAL_REPORTS_MESSAGES.ID_REPORT_INVALID,
      );
    });

    it('lanza NotFound si no existe', async () => {
      reportModel.findById.mockResolvedValue(null);

      await expect(service.findOne(VALID_ID)).rejects.toThrow(NotFoundException);
    });

    it('retorna el reporte si existe', async () => {
      const report = buildReport();
      reportModel.findById.mockResolvedValue(report);

      await expect(service.findOne(VALID_ID)).resolves.toBe(report);
    });
  });

  describe('update', () => {
    it('lanza BadRequest si se intenta cambiar el patientId', async () => {
      reportModel.findById.mockResolvedValue(buildReport());

      await expect(
        service.update(VALID_ID, { patientId: PATIENT_ID } as any, USER_ID),
      ).rejects.toThrow(MEDICAL_REPORTS_MESSAGES.PATIENT_ID_NOT_REQUIRED);
    });

    it('actualiza los detalles y reasigna el userId', async () => {
      const report = buildReport();
      reportModel.findById.mockResolvedValue(report);

      const result = await service.update(
        VALID_ID,
        { details: 'Nuevo detalle' } as any,
        USER_ID,
      );

      expect(report.updateOne).toHaveBeenCalledWith({
        details: 'Nuevo detalle',
        userId: USER_ID,
      });
      expect(result).toBe('Reporte medico actualizado');
    });
  });

  describe('remove', () => {
    it('elimina el reporte existente', async () => {
      const report = buildReport();
      reportModel.findById.mockResolvedValue(report);

      const result = await service.remove(VALID_ID);

      expect(report.deleteOne).toHaveBeenCalled();
      expect(result).toBe('Se ha eliminado el reporte clínico');
    });
  });
});
