import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Patient } from './entities/patient.entity';
import { isValidObjectId, Model } from 'mongoose';
import { OwnerService } from 'src/owner/owner.service';
import { PATIENT_MESSAGES } from './constants/patient-messages';

@Injectable()
export class PatientService {
  constructor(
    @InjectModel(Patient.name) private readonly patientModel: Model<Patient>,
    private readonly ownerService: OwnerService,
  ) {}
  async create(userId: string, createPatientDto: CreatePatientDto) {
    await this.ensureOwnerExist(createPatientDto.ownerId);
    const patient = new this.patientModel(createPatientDto);
    patient.registeredBy = userId;
    await patient.save();

    return 'Paciente registrado';
  }

  async findAll() {
    const patients = this.patientModel
      .find({ isDeleted: false })
      .select('-__v')
      .populate({
        path: 'ownerId',
        select: '-__v -createdAt -updatedAt -deletedAt -isDeleted',
      })
      .populate({ path: 'registeredBy', select: '_id firstName role' })
      .populate({ path: 'deletedBy', select: '_id firstName role' })
      .exec();
    return patients;
  }

  async getMyPatients(userId: string) {
    const myPatients = await this.patientModel.find({
      registeredBy: userId,
      isDeleted: false,
    });
    return myPatients;
  }

  async findOne(id: string) {
    if (!isValidObjectId(id))
      throw new BadRequestException(PATIENT_MESSAGES.ID_PATIENT_NOT_VALID);
    const foundPatient = await this.patientModel
      .findById(id)
      .select('-__v')
      .populate({ path: 'ownerId', select: '-__v -createdAt -updatedAt' })
      .populate({ path: 'registeredBy', select: '_id firstName role' })
      .populate({ path: 'deletedBy', select: '_id firstName role' })
      .exec();

    if (!foundPatient)
      throw new NotFoundException(PATIENT_MESSAGES.PATIENT_NOT_FOUND);
    if (foundPatient.isDeleted)
      throw new NotFoundException(PATIENT_MESSAGES.PATIENT_NOT_FOUND);
    return foundPatient;
  }

  async findSimpleOneById(id: string) {
    const foundPatient = await this.patientModel.findById(id);
    if (!foundPatient)
      throw new NotFoundException(PATIENT_MESSAGES.PATIENT_NOT_FOUND);
    return foundPatient;
  }

  async update(id: string, updatePatientDto: UpdatePatientDto) {
    const foundPatient = await this.findOne(id);

    await foundPatient.updateOne(updatePatientDto);

    return 'Paciente actualizado';
  }

  async desactivatePatient(id: string) {
    const foundPatient = await this.findOne(id);
    foundPatient.isActive = false;
    await foundPatient.save();
    return 'Paciente desactivado';
  }

  async activatePatient(id: string) {
    const foundPatient = await this.findOne(id);
    foundPatient.isActive = true;

    await foundPatient.save();
    return 'Paciente activado';
  }

  async remove(idUser: string, id: string) {
    const foundPatient = await this.findOne(id);
    foundPatient.isDeleted = true;
    foundPatient.deletedAt = new Date();
    foundPatient.isActive = false;
    foundPatient.deletedBy = idUser;
    await foundPatient.save();

    return 'Paciente eliminado';
  }

  private async ensureOwnerExist(id: string) {
    const foundOwner = await this.ownerService.findOne(id);
    if (!foundOwner)
      throw new NotFoundException(PATIENT_MESSAGES.OWNER_NOT_FOUND);
    return foundOwner;
  }
}
