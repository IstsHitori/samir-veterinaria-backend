import {
  Injectable,
  Inject,
  forwardRef,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { User } from './entities/user.entity';
import { AuthService } from 'src/auth/auth.service';
import { USER_VALIDATION_MESSAGES } from './constants';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}
  async findAll(userId: string) {
    return await this.userModel
      .find({ _id: { $ne: userId }, isDeleted: false })
      .select('-password -__v');
  }

  async findOne(id: string) {
    if (!isValidObjectId(id))
      throw new BadRequestException(USER_VALIDATION_MESSAGES.ID_USER_NOT_VALID);
    const foundUser = await this.userModel.findById(id);
    if (!foundUser)
      throw new NotFoundException(USER_VALIDATION_MESSAGES.USER_NOT_FOUND);
    return foundUser;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const foundUser =
      await this.authService.findAndValidateUserExistAndActive(id);

    await foundUser.updateOne(updateUserDto);
    return 'Perfil actualizado';
  }

  async remove(id: string) {
    const user = await this.findOne(id);

    if (user.isDeleted)
      throw new NotFoundException(USER_VALIDATION_MESSAGES.USER_NOT_FOUND);

    user.isActive = false;

    user.isDeleted = true;

    user.deletedAt = new Date();

    await user.save();
    return 'Se ha eliminado el usuario';
  }

  async findUserByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  async desactivateUser(id: string) {
    const user = await this.findOne(id);

    user.isActive = false;

    await user.save();

    return 'Se ha desactivado el usuario';
  }

  async activateUser(id: string) {
    const user = await this.findOne(id);

    user.isActive = true;

    await user.save();

    return 'Se ha activado el usuario';
  }
}
