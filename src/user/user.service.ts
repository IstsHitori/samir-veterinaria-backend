import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  async findOne(id: string) {
    return await this.userModel.findById(id);
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const foundUser =
      await this.authService.findAndValidateUserExistAndActive(id);

    await foundUser.updateOne(updateUserDto);
    return 'Perfil actualizado';
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async findUserByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }
}
