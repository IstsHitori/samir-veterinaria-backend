import { ObjectId } from 'mongodb';

export interface IUser {
  _id: ObjectId;
  firstName: string;
  lastName: string;
  role: string;
}

export interface IPatient {
  _id: ObjectId;
  name: string;
  type: string;
  breed: string;
  birthDate: Date;
  gender: string;
  weight: string;
  size: string;
  history: string;
  ownerId: ObjectId;
  medicalConditions: string[];
  allergies: string[];
  isVaccinated: boolean;
  vaccines: string[];
  isActive: boolean;
  deletedAt: Date | null;
  deletedBy: ObjectId;
  isDeleted: boolean;
  registeredBy: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMedicalReport {
  _id: ObjectId;
  userId: IUser;
  patientId: IPatient;
  details: string;
  createdAt: Date;
  updatedAt: Date;
  __v: number;
}
