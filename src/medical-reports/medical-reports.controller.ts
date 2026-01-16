import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MedicalReportsService } from './medical-reports.service';
import { CreateMedicalReportDto } from './dto/create-medical-report.dto';
import { UpdateMedicalReportDto } from './dto/update-medical-report.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/user/constants';

@Controller('medical-reports')
export class MedicalReportsController {
  constructor(private readonly medicalReportsService: MedicalReportsService) {}

  @Auth(Role.ADMIN, Role.VETERINARY)
  @Post()
  create(
    @Body() createMedicalReportDto: CreateMedicalReportDto,
    @GetUser('_id') idUser: string,
  ) {
    return this.medicalReportsService.create(createMedicalReportDto, idUser);
  }

  @Auth(Role.ADMIN, Role.VETERINARY)
  @Get()
  async findAll() {
    const reports = await this.medicalReportsService.findAllByPatient();
    return { reports };
  }

  @Auth(Role.ADMIN, Role.VETERINARY)
  @Get('/patient/:id')
  findPatientReports(@Param('id') id: string) {
    return this.medicalReportsService.findAllByIdPatient(id);
  }

  @Auth(Role.ADMIN, Role.VETERINARY)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.medicalReportsService.findOne(id);
  }

  @Auth(Role.ADMIN, Role.VETERINARY)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateMedicalReportDto: UpdateMedicalReportDto,
    @GetUser('_id') idUser: string,
  ) {
    return this.medicalReportsService.update(
      id,
      updateMedicalReportDto,
      idUser,
    );
  }

  @Auth(Role.ADMIN, Role.VETERINARY)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.medicalReportsService.remove(id);
  }
}
