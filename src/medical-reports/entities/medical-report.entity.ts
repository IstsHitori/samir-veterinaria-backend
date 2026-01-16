import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class MedicalReport {
  @Prop({
    type: String,
    required: true,
    ref: 'User',
  })
  userId: string;

  @Prop({
    type: String,
    required: true,
    ref: 'Patient',
  })
  patientId: string;

  @Prop({
    type: String,
    required: true,
  })
  details: string;
}

export const medicalReportSchema = SchemaFactory.createForClass(MedicalReport);
