import { Module } from '@nestjs/common';
import { PatientService } from './patient.service';
import { PatientController } from './patient.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Patient, PatientSchema } from './entities/patient.entity';
import {
  MedicalReport,
  medicalReportSchema,
} from 'src/medical-reports/entities/medical-report.entity';
import { OwnerModule } from 'src/owner/owner.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Patient.name,
        schema: PatientSchema,
      },
      {
        name: MedicalReport.name,
        schema: medicalReportSchema,
      },
    ]),
    OwnerModule,
    AuthModule,
  ],
  controllers: [PatientController],
  providers: [PatientService],
  exports: [PatientService],
})
export class PatientModule {}
