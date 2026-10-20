import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { PatientService } from './patient.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/user/constants';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@Controller('patient')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()
  @Auth(Role.ADMIN, Role.AUXILIARY, Role.VETERINARY)
  create(
    @GetUser('_id') idUser: string,
    @Body() createPatientDto: CreatePatientDto,
  ) {
    return this.patientService.create(idUser, createPatientDto);
  }

  @Get()
  @Auth(Role.ADMIN, Role.AUXILIARY, Role.VETERINARY)
  async findAll() {
    const patients = await this.patientService.findAll();
    return { patients };
  }
  @Get('my-patients')
  @Auth(Role.ADMIN, Role.VETERINARY)
  getMyPatients(@GetUser('_id') userId: string) {
    return this.patientService.getMyPatients(userId);
  }

  @Get(':id')
  @Auth(Role.ADMIN, Role.AUXILIARY, Role.VETERINARY)
  findOne(@Param('id') id: string) {
    return this.patientService.findOne(id);
  }

  @Patch(':id')
  @Auth(Role.ADMIN, Role.AUXILIARY)
  update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
    return this.patientService.update(id, updatePatientDto);
  }

  @Patch(':id/desactivate')
  @Auth(Role.ADMIN)
  desactivatePatient(@Param('id') id: string) {
    return this.patientService.desactivatePatient(id);
  }

  @Patch(':id/activate')
  @Auth(Role.ADMIN)
  activatePatient(@Param('id') id: string) {
    return this.patientService.activatePatient(id);
  }

  @Delete(':id')
  @Auth(Role.ADMIN, Role.AUXILIARY)
  remove(@GetUser('_id') idUser: string, @Param('id') id: string) {
    return this.patientService.remove(idUser, id);
  }
}
