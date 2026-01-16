import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateMedicalReportDto } from './dto/create-medical-report.dto';
import { UpdateMedicalReportDto } from './dto/update-medical-report.dto';
import { isValidObjectId, Model } from 'mongoose';
import { MedicalReport } from './entities/medical-report.entity';
import { InjectModel } from '@nestjs/mongoose';
import { MEDICAL_REPORTS_MESSAGES } from './constants/medical-report-messages';
import { UserService } from 'src/user/user.service';
import { PatientService } from 'src/patient/patient.service';
import { IMedicalReport, IPatient, IUser } from './constants/interfaces';

@Injectable()
export class MedicalReportsService {
  constructor(
    @InjectModel(MedicalReport.name)
    private readonly medicalReportModel: Model<MedicalReport>,
    private readonly userService: UserService,
    private readonly patientService: PatientService,
  ) {}
  async create(createMedicalReportDto: CreateMedicalReportDto, idUser: string) {
    await this.userService.findOne(idUser);
    await this.patientService.findSimpleOneById(
      createMedicalReportDto.patientId,
    );

    const newMedicalReport = new this.medicalReportModel({
      ...createMedicalReportDto,
      userId: idUser,
    });
    await newMedicalReport.save();

    return 'Reporte médico creado';
  }

  async findAllByPatient() {
    const reports = await this.medicalReportModel
      .find<IMedicalReport>()
      .populate({ path: 'patientId', select: '-__v' })
      .populate({
        path: 'userId',
        select: '_id firstName lastName role',
      });
    // Agrupar por paciente
    const grouped = new Map<
      string,
      {
        patient: IPatient;
        reports: {
          _id: string;
          details: string;
          createdAt: Date;
          updatedAt: Date;
          user: IUser;
        }[];
      }
    >();

    for (const report of reports) {
      const patientId = report.patientId._id.toString();

      if (!grouped.has(patientId)) {
        grouped.set(patientId, {
          patient: report.patientId,
          reports: [],
        });
      }

      grouped.get(patientId)?.reports.push({
        _id: report._id.toString(),
        details: report.details,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
        user: report.userId,
      });
    }

    // Convertir el Map a array
    return Array.from(grouped.values());
  }

  async findAllByIdPatient(id: string) {
    await this.patientService.findOne(id);

    const reportsPatient = await this.medicalReportModel
      .find({
        patientId: id,
      })
      .populate({
        path: 'userId',
        select: '_id firstName lastName role email',
      });
    return reportsPatient;
  }
  async findOne(id: string) {
    if (!isValidObjectId(id))
      throw new BadRequestException(MEDICAL_REPORTS_MESSAGES.ID_REPORT_INVALID);
    const foundReport = await this.medicalReportModel.findById(id);
    if (!foundReport)
      throw new NotFoundException(MEDICAL_REPORTS_MESSAGES.REPORT_NOT_FOUND);
    return foundReport;
  }

  async update(
    id: string,
    updateMedicalReportDto: UpdateMedicalReportDto,
    idUser: string,
  ) {
    const foundReport = await this.findOne(id);
    if (updateMedicalReportDto.patientId)
      throw new BadRequestException(
        MEDICAL_REPORTS_MESSAGES.PATIENT_ID_NOT_REQUIRED,
      );
    updateMedicalReportDto = { ...updateMedicalReportDto };
    await foundReport.updateOne({ ...updateMedicalReportDto, userId: idUser });

    return 'Reporte medico actualizado';
  }

  async remove(id: string) {
    const foundReport = await this.findOne(id);
    await foundReport.deleteOne();
    return 'Se ha eliminado el reporte clínico';
  }
}
