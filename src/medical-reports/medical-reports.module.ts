import { Module } from '@nestjs/common';
import { MedicalReportsService } from './medical-reports.service';
import { MedicalReportsController } from './medical-reports.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  MedicalReport,
  medicalReportSchema,
} from './entities/medical-report.entity';
import { UserModule } from 'src/user/user.module';
import { PatientModule } from 'src/patient/patient.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: MedicalReport.name,
        schema: medicalReportSchema,
      },
    ]),
    UserModule,
    PatientModule,
    AuthModule,
  ],
  controllers: [MedicalReportsController],
  providers: [MedicalReportsService],
})
export class MedicalReportsModule {}
