import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from 'src/user/entities/user.entity';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { USER_VALIDATION_MESSAGES } from 'src/user/constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    configService: ConfigService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SEED');
    if (!jwtSecret)
      throw new UnauthorizedException(USER_VALIDATION_MESSAGES.JWT_EMPTY);
    super({
      secretOrKey: jwtSecret,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: JwtPayload): Promise<User> {
    const { id } = payload;
    const user = await this.userModel
      .findById(id)
      .select('-password -deletedAt -isDeleted -lastLogin -__v');

    if (!user)
      throw new UnauthorizedException(
        USER_VALIDATION_MESSAGES.JWT_TOKEN_NOT_VALID,
      );
    if (!user.isActive)
      throw new UnauthorizedException(USER_VALIDATION_MESSAGES.USER_INACTIVE);
    if (user.isDeleted)
      throw new UnauthorizedException(USER_VALIDATION_MESSAGES.USER_NOT_FOUND);
    //Cuando todas las condiciones pasan, el user se añade al Request: ejemplo: Req.user
    return user;
  }
}
