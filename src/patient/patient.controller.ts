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
  @Auth(Role.ADMIN, Role.AUXILIARY)
  create(
    @GetUser('_id') idUser: string,
    @Body() createPatientDto: CreatePatientDto,
  ) {
    return this.patientService.create(idUser, createPatientDto);
  }

  @Get()
  @Auth(Role.ADMIN, Role.AUXILIARY)
  findAll() {
    return this.patientService.findAll();
  }

  @Get(':id')
  @Auth(Role.ADMIN, Role.AUXILIARY)
  findOne(@Param('id') id: string) {
    return this.patientService.findOne(id);
  }

  @Patch(':id')
  @Auth(Role.ADMIN, Role.AUXILIARY)
  update(@Param('id') id: string, @Body() updatePatientDto: UpdatePatientDto) {
    return this.patientService.update(id, updatePatientDto);
  }

  @Delete(':id')
  @Auth(Role.ADMIN, Role.AUXILIARY)
  remove(@GetUser('_id') idUser: string, @Param('id') id: string) {
    return this.patientService.remove(idUser, id);
  }
}
