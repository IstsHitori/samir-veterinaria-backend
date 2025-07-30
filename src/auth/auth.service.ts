import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ENCRYPTION_SERVICE,
  EncryptionService,
} from 'src/common/interfaces/Encryption-service.interface';
import { MailService } from 'src/mail/mail.service';
import { Token } from 'src/token/entities/token.entity';
import { USER_VALIDATION_MESSAGES } from 'src/user/constants';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { generateNumericToken } from './helpers/number-token';
import { EmailsTemplates } from 'src/mail/templates/emails.templates';
import { ConfigService } from '@nestjs/config';
import { TokenType } from 'src/token/constants/token-type';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Token.name)
    private readonly tokenModel: Model<Token>,

    private readonly userService: UserService,
    @Inject(ENCRYPTION_SERVICE)
    private readonly encryptionAdapter: EncryptionService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    await this.ensureUserDoesNotExist(createUserDto.email);
    const user = await this.createUser(createUserDto);
    const token = this.createToken(user._id as string);

    await Promise.all([user.save(), token.save()]);

    await this.sendConfirmationEmail(user.email, token.value);
    return 'Se ha registrado la cuenta correctamente';
  }

  private async ensureUserDoesNotExist(email: string) {
    const existUser = await this.userService.findUserByEmail(email);
    if (existUser) {
      throw new BadRequestException(
        USER_VALIDATION_MESSAGES.USER_ALREADY_EXIST,
      );
    }
  }

  private async createUser(createUserDto: CreateUserDto): Promise<User> {
    const user = new this.userModel(createUserDto);
    user.password = await this.encryptionAdapter.hash(createUserDto.password);
    return user;
  }

  private createToken(userId: string): Token {
    return new this.tokenModel({
      userId,
      value: generateNumericToken(),
      type: TokenType.CONFIRMATION,
    });
  }

  private async sendConfirmationEmail(email: string, token: string) {
    const hasSend = await this.mailService.sendEmail({
      to: email,
      subject: 'Confirmar cuenta',
      htmlBody: EmailsTemplates.getConfirmationTemplate({
        token,
        FRONT_URL: this.configService.get<string>('FRONT_URL')!,
        to: email,
      }),
    });
    if (!hasSend)
      throw new BadRequestException(USER_VALIDATION_MESSAGES.SEND_MAIL_ERROR);
  }
}
