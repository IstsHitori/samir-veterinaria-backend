import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export type PatientDocument = Patient & Document;

export enum Gender {
  MALE = 'masculino',
  FEMALE = 'femenino',
}

export enum Size {
  SMALL = 'pequeno',
  MEDIUM = 'mediano',
  LARGE = 'grande',
}

export enum Species {
  DOG = 'perro',
  CAT = 'gato',
  BIRD = 'ave',
  RABBIT = 'conejo',
  HAMSTER = 'hamster',
  TURTLE = 'tortuga',
  FISH = 'pez',
  FERRET = 'huron',
  OTHER = 'otro',
}

@Schema({
  timestamps: true,
})
export class Patient {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, type: String, enum: Species })
  type: string;

  @Prop({ required: true })
  breed: string;

  @Prop({ required: true })
  birthDate: Date;

  @Prop({ required: true, type: String, enum: Gender })
  gender: Gender;

  @Prop({ required: true })
  weight: string;

  @Prop({ required: true, type: String, enum: Size })
  size: Size;

  @Prop({
    default: '',
  })
  history: string;

  @Prop({ required: true, type: mongoose.Schema.ObjectId, ref: 'Owner' })
  ownerId: string;

  @Prop({
    default: [],
  })
  medicalConditions: string[];

  @Prop({
    default: [],
  })
  allergies: string[];

  @Prop({ default: false })
  isVaccinated: boolean;

  @Prop({
    default: [],
  })
  vaccines: string[];

  @Prop({ default: true })
  isActive: boolean;

  @Prop({
    default: null,
  })
  deletedAt: Date;

  @Prop({
    default: null,
    type: mongoose.Schema.ObjectId,
    ref: 'User',
  })
  deletedBy: string;

  @Prop({ default: false })
  isDeleted: boolean;

  @Prop({ required: true, type: mongoose.Schema.ObjectId, ref: 'User' })
  registeredBy: string;
}

export const PatientSchema = SchemaFactory.createForClass(Patient);
