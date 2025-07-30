import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import {
  ENCRYPTION_SERVICE,
  EncryptionService,
} from 'src/common/interfaces/Encryption-service.interface';
import { MailService } from 'src/mail/mail.service';
import { Token } from 'src/token/entities/token.entity';
import { USER_VALIDATION_MESSAGES } from 'src/user/constants';
import { User } from 'src/user/entities/user.entity';
import { UserService } from 'src/user/user.service';
import { generateNumericToken } from './helpers/number-token';
import { ConfigService } from '@nestjs/config';
import { TOKEN_TYPE } from 'src/token/constants/token-type';
import { TokenService } from 'src/token/token.service';
import { TOKEN_MESSAGES } from 'src/common/constants/token-messages';
import { EMAIL_TYPE } from 'src/mail/interfaces/email-type';
import { getTemplateEmail } from './helpers/get-options-email';
import { CreateUserDto, LoginUserDto } from 'src/user/dto';
import { ForgotPasswordDto, ValidateTokenDto, UpdatePasswordDto } from './dto';

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
    const token = this.createToken(user._id as string, TOKEN_TYPE.CONFIRMATION);

    await Promise.all([user.save(), token.save()]);

    await this.sendEmail(user.email, token.value, EMAIL_TYPE.CONFIRM_ACCOUNT);
    return 'Se ha registrado la cuenta correctamente';
  }

  async login({ password, email }: LoginUserDto) {
    const foundUser = await this.findAndValidateUserExistAndActive(email);
    await this.isMatchPasswordLogin(password, foundUser.password);
    return 'Iniciando sesion...';
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

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const foundUser = await this.userService.findUserByEmail(
      forgotPasswordDto.email,
    );
    if (!foundUser)
      throw new NotFoundException(USER_VALIDATION_MESSAGES.USER_NOT_FOUND);
    const token = this.createToken(
      foundUser._id as string,
      TOKEN_TYPE.PASSWORD_RESET,
    );
    await Promise.all([
      token.save(),
      this.sendEmail(foundUser.email, token.value, EMAIL_TYPE.RESET_PASSWORD),
    ]);

    return 'Se ha enviado al email las instrucciones para recuperar la contraseña';
  }

  async validateToken(validateTokenDto: ValidateTokenDto) {
    await this.findAndValidateToken(
      validateTokenDto.token,
      TOKEN_TYPE.PASSWORD_RESET,
    );
    return 'Token validado correctamente';
  }

  async updatePassword(updatePasswordDto: UpdatePasswordDto, token: string) {
    const foundToken = await this.findAndValidateToken(
      token,
      TOKEN_TYPE.PASSWORD_RESET,
    );
    const foundUser = await this.findAndValidateUserExistAndActive(
      foundToken.userId,
    );
    const newPasswordHashed = await this.encryptionAdapter.hash(
      updatePasswordDto.newPassword,
    );
    foundUser.password = newPasswordHashed;
    await Promise.all([foundUser.save(), foundToken.deleteOne()]);
    return 'Se ha cambiado la contraseña correctamente';
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

  private createToken(userId: string, tokenType: TOKEN_TYPE): Token {
    return new this.tokenModel({
      userId,
      value: generateNumericToken(),
      type: tokenType,
    });
  }

  private async sendEmail(email: string, token: string, emailType: EMAIL_TYPE) {
    const FRONT_URL = this.configService.get<string>('FRONT_URL')!;
    const template = getTemplateEmail({ token, email, FRONT_URL, emailType });
    const hasSend = await this.mailService.sendEmail({
      to: email,
      subject: emailType,
      htmlBody: template,
    });
    if (!hasSend)
      throw new BadRequestException(USER_VALIDATION_MESSAGES.SEND_MAIL_ERROR);
  }

  private async findAndValidateToken(value: string, tokenType: TOKEN_TYPE) {
    const foundToken = await this.tokenService.findOneByToken(value);
    if (!foundToken)
      throw new NotFoundException(TOKEN_MESSAGES.TOKEN_NOT_FOUND);
    if (foundToken.type !== tokenType)
      throw new BadRequestException(TOKEN_MESSAGES.TOKEN_INVALID);
    return foundToken;
  }

  private async findAndValidateUserExistAndActive(term: string) {
    let foundUser: User | null = null;
    const isMongoId = isValidObjectId(term);
    if (isMongoId) {
      foundUser = await this.userService.findOne(term);
    } else {
      foundUser = await this.userService.findUserByEmail(term);
    }
    if (!foundUser)
      throw new NotFoundException(USER_VALIDATION_MESSAGES.USER_NOT_FOUND);

    if (foundUser.isDeleted)
      throw new NotFoundException(USER_VALIDATION_MESSAGES.USER_NOT_FOUND);

    if (!foundUser.isActive)
      throw new BadRequestException(USER_VALIDATION_MESSAGES.USER_INACTIVE);

    return foundUser;
  }

  private async isMatchPasswordLogin(password: string, passwordHashed: string) {
    const isMatch = await this.encryptionAdapter.compare(
      password,
      passwordHashed,
    );

    if (!isMatch)
      throw new BadRequestException(USER_VALIDATION_MESSAGES.PASSWORD_INVALID);
  }
}
