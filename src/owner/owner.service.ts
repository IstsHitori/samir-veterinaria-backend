import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { Owner } from './entities/owner.entity';
import { OWNER_MESSAGES } from './constants/owner-messages';

@Injectable()
export class OwnerService {
  constructor(
    @InjectModel(Owner.name) private readonly ownerModel: Model<Owner>,
  ) {}
  async create(createOwnerDto: CreateOwnerDto) {
    await this.ensureOwnerDoesNotExist(createOwnerDto);
    const owner = await this.ownerModel.create(createOwnerDto);
    return {
      ownerId: owner._id,
      message: 'Dueño creado',
    };
  }

  async findAll() {
    const owners = await this.ownerModel
      .find({ isDeleted: false })
      .select('-__v -isDeleted -deletedAt');
    return owners;
  }

  async findAllOwnersWithPatients() {
    const ownersWithPatients = await this.ownerModel.aggregate([
      { $match: { isDeleted: false } },
      {
        $lookup: {
          from: 'patients',
          let: { ownerId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ['$ownerId', '$$ownerId'] },
              },
            },
            {
              $lookup: {
                from: 'users',
                localField: 'registeredBy',
                foreignField: '_id',
                as: 'registeredBy',
              },
            },
            {
              $unwind: {
                path: '$registeredBy',
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $project: {
                // Incluye todos los campos del paciente
                _id: 1,
                name: 1,
                type: 1,
                breed: 1,
                birthDate: 1,
                gender: 1,
                weight: 1,
                size: 1,
                history: 1,
                ownerId: 1,
                medicalConditions: 1,
                allergies: 1,
                isVaccinated: 1,
                vaccines: 1,
                isActive: 1,
                deletedAt: 1,
                deletedBy: 1,
                isDeleted: 1,
                createdAt: 1,
                updatedAt: 1,
                // registeredBy con campos filtrados
                registeredBy: {
                  _id: '$registeredBy._id',
                  firstName: '$registeredBy.firstName',
                  role: '$registeredBy.role',
                },
              },
            },
          ],
          as: 'patients',
        },
      },
    ]);
    return ownersWithPatients;
  }

  async findOne(id: string) {
    if (!isValidObjectId(id))
      throw new BadRequestException(OWNER_MESSAGES.ID_WONER_NOT_VALID);
    const foundOwner = await this.ownerModel.findById(id);
    if (!foundOwner) throw new NotFoundException(OWNER_MESSAGES.OWNER_NOT_FOUD);
    if (foundOwner.isDeleted)
      throw new NotFoundException(OWNER_MESSAGES.OWNER_NOT_FOUD);
    return foundOwner;
  }

  async update(id: string, updateOwnerDto: UpdateOwnerDto) {
    const foundOwner = await this.findOne(id);
    if (updateOwnerDto.email && updateOwnerDto.email !== foundOwner.email) {
      await this.assertEmailIsUnique(id, updateOwnerDto.email);
    }
    if (
      updateOwnerDto.document &&
      updateOwnerDto.document !== foundOwner.document
    ) {
      await this.assertDocumentIsUnique(id, updateOwnerDto.document);
    }
    await foundOwner.updateOne(updateOwnerDto);

    return 'Se acutalizó el dueño';
  }

  async remove(id: string) {
    const foundOwner = await this.findOne(id);
    foundOwner.isDeleted = true;
    foundOwner.deletedAt = new Date();
    await foundOwner.save();
    return 'Se eliminó el dueño';
  }

  private async ensureOwnerDoesNotExist({ document, email }: CreateOwnerDto) {
    const foundOwnerByEmail = await this.ownerModel.findOne({ email });
    if (foundOwnerByEmail)
      throw new BadRequestException(OWNER_MESSAGES.OWNER_EMAIL_EXIST);
    const foundOwnerByDocument = await this.ownerModel.findOne({ document });
    if (foundOwnerByDocument)
      throw new BadRequestException(OWNER_MESSAGES.OWNER_DOCUMENT_EXIST);
  }

  private async findOwnerByEmail(email: string) {
    const foundUser = await this.ownerModel.findOne({ email });
    return foundUser;
  }

  private async findOwnerByDocument(document: string) {
    const foundUser = await this.ownerModel.findOne({ document });
    return foundUser;
  }

  private async assertEmailIsUnique(id: string, email: string) {
    const foundOwnerByDcoument = await this.findOwnerByEmail(email);
    if (foundOwnerByDcoument && foundOwnerByDcoument._id.toString() !== id)
      throw new BadRequestException(OWNER_MESSAGES.EMAIL_UNIQUE);
  }

  private async assertDocumentIsUnique(id: string, document: string) {
    const foundOwnerByEmail = await this.findOwnerByDocument(document);
    if (foundOwnerByEmail && foundOwnerByEmail._id.toString() !== id)
      throw new BadRequestException(OWNER_MESSAGES.DOCUMENT_UNIQUE);
  }
}
