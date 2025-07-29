import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ENCRYPTION_SERVICE,
  EncryptionService,
} from 'src/common/interfaces/Encryption-service.interface';
import { USER_VALIDATION_MESSAGES } from 'src/user/constants';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    private readonly userService: UserService,
    @Inject(ENCRYPTION_SERVICE)
    private readonly encryptionAdapter: EncryptionService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existUser = await this.userService.findUserByEmail(
      createUserDto.email,
    );
    if (existUser)
      throw new BadRequestException(
        USER_VALIDATION_MESSAGES.USER_ALREADY_EXIST,
      );
    const user = new this.userModel(createUserDto);
    user.password = await this.encryptionAdapter.hash(createUserDto.password);
    return user;
  }
}
