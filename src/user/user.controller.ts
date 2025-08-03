import { Controller, Get, Body, Patch, Param, Delete } from '@nestjs/common';
import { UserService } from './user.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from './constants';
import { GetUser } from 'src/auth/decorators/get-user.decorator';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Auth(Role.ADMIN)
  async findAll(@GetUser('_id') userId: string) {
    const users = await this.userService.findAll(userId);
    return { users };
  }

  @Get(':id')
  @Auth(Role.ADMIN)
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  @Auth(Role.ADMIN)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Patch(':id/desactivate')
  @Auth(Role.ADMIN)
  desactivateUser(@Param('id') id: string) {
    return this.userService.desactivateUser(id);
  }

  @Patch(':id/activate')
  @Auth(Role.ADMIN)
  activateUser(@Param('id') id: string) {
    return this.userService.activateUser(id);
  }

  @Delete(':id')
  @Auth(Role.ADMIN)
  remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
