import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { TOKEN_TYPE } from 'src/token/constants/token-type';
import { TokenService } from 'src/token/token.service';
import { TOKEN_MESSAGES } from 'src/common/constants/token-messages';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @InjectModel(Token.name)
    private readonly tokenModel: Model<Token>,
    @Inject(ENCRYPTION_SERVICE)
    private readonly encryptionAdapter: EncryptionService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly tokenService: TokenService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    await this.ensureUserDoesNotExist(createUserDto.email);
    const user = await this.createUser(createUserDto);
    const token = this.createToken(user._id as string);

    await Promise.all([user.save(), token.save()]);

    await this.sendConfirmationEmail(user.email, token.value);
    return 'Se ha registrado la cuenta correctamente';
  }

  async confirmAccount(token: string) {
    const foundToken = await this.tokenService.findOneByToken(token);
    if (!foundToken)
      throw new NotFoundException(TOKEN_MESSAGES.TOKEN_NOT_FOUND);

    if (foundToken.type !== TOKEN_TYPE.CONFIRMATION)
      throw new BadRequestException(TOKEN_MESSAGES.TOKEN_INVALID);

    const foundUser = await this.userService.findOne(foundToken.userId);
    if (!foundUser || foundUser.isDeleted)
      throw new NotFoundException(USER_VALIDATION_MESSAGES.USER_NOT_FOUND);

    if (!foundUser.isActive)
      throw new BadRequestException(USER_VALIDATION_MESSAGES.USER_INACTIVE);

    foundUser.emailValidated = true;
    await Promise.all([foundToken.deleteOne(), foundUser.save()]);
    return 'Cuenta confirmada correctamente';
  }

  //--------------------
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
      type: TOKEN_TYPE.CONFIRMATION,
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
