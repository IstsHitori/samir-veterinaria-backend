import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { OwnerService } from './owner.service';
import { CreateOwnerDto } from './dto/create-owner.dto';
import { UpdateOwnerDto } from './dto/update-owner.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/user/constants';

@Controller('owner')
export class OwnerController {
  constructor(private readonly ownerService: OwnerService) {}

  @Post()
  @Auth(Role.ADMIN, Role.AUXILIARY, Role.VETERINARY)
  create(@Body() createOwnerDto: CreateOwnerDto) {
    const result = this.ownerService.create(createOwnerDto);
    return result;
  }

  @Get()
  @Auth(Role.ADMIN, Role.AUXILIARY, Role.VETERINARY)
  async findAll() {
    const owners = await this.ownerService.findAll();
    return { owners };
  }

  @Auth(Role.ADMIN, Role.AUXILIARY, Role.VETERINARY)
  @Get('pets')
  async findAllOwnersWithPets() {
    const ownersWithPets = await this.ownerService.findAllOwnersWithPatients();
    return {
      owners: ownersWithPets,
    };
  }

  @Get(':id')
  @Auth(Role.ADMIN, Role.AUXILIARY, Role.VETERINARY)
  findOne(@Param('id') id: string) {
    return this.ownerService.findOne(id);
  }

  @Patch(':id')
  @Auth(Role.ADMIN, Role.AUXILIARY)
  update(@Param('id') id: string, @Body() updateOwnerDto: UpdateOwnerDto) {
    return this.ownerService.update(id, updateOwnerDto);
  }

  @Delete(':id')
  @Auth(Role.ADMIN, Role.AUXILIARY)
  remove(@Param('id') id: string) {
    return this.ownerService.remove(id);
  }
}
