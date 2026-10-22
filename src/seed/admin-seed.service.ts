import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isEmail } from 'class-validator';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ENCRYPTION_SERVICE,
  EncryptionService,
} from 'src/common/interfaces/Encryption-service.interface';
import { Role } from 'src/user/constants';
import { User } from 'src/user/entities/user.entity';

export const ADMIN_PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$#!%*?&])[A-Za-z\d@$#!%*?&]{8,}$/;

export const SEED_MESSAGES = {
  ADMIN_ALREADY_EXISTS: 'Ya existe un administrador. Seed omitido.',
  ADMIN_CREATED: 'Administrador inicial creado',
  ADMIN_RESTORED: 'Administrador inicial restaurado',
  EMAIL_MISSING: 'Falta la variable de entorno SEED_ADMIN_EMAIL',
  EMAIL_INVALID: 'SEED_ADMIN_EMAIL no es un email válido',
  PASSWORD_MISSING: 'Falta la variable de entorno SEED_ADMIN_PASSWORD',
  PASSWORD_WEAK:
    'SEED_ADMIN_PASSWORD debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial (@$#!%*?&)',
  EMAIL_TAKEN_BY_OTHER_ROLE:
    'SEED_ADMIN_EMAIL ya está en uso por un usuario que no es administrador. No se promueve automáticamente.',
  DUPLICATE_EMAIL:
    'Otro proceso creó el administrador al mismo tiempo. Seed omitido.',
} as const;

@Injectable()
export class AdminSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminSeedService.name);

  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<User>,
    @Inject(ENCRYPTION_SERVICE)
    private readonly encryptionAdapter: EncryptionService,
    private readonly configService: ConfigService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.seed();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Seed de administrador omitido: ${message}`);
    }
  }

  async seed(): Promise<void> {
    const existingAdmin = await this.userModel.findOne({
      role: Role.ADMIN,
      isDeleted: false,
      isActive: true,
    });

    if (existingAdmin) {
      this.logger.log(SEED_MESSAGES.ADMIN_ALREADY_EXISTS);
      return;
    }

    const email = this.getRequired('SEED_ADMIN_EMAIL').toLowerCase();
    const password = this.getRequired('SEED_ADMIN_PASSWORD');
    const firstName = this.getOptional('SEED_ADMIN_FIRST_NAME') ?? 'Admin';
    const lastName = this.getOptional('SEED_ADMIN_LAST_NAME') ?? 'Sistema';

    if (!ADMIN_PASSWORD_REGEX.test(password)) {
      throw new Error(SEED_MESSAGES.PASSWORD_WEAK);
    }

    if (!isEmail(email)) {
      throw new Error(SEED_MESSAGES.EMAIL_INVALID);
    }

    const hashedPassword = await this.encryptionAdapter.hash(password);

    const userWithSameEmail = await this.userModel.findOne({ email });

    if (userWithSameEmail) {
      return this.restoreAdmin(
        userWithSameEmail,
        { firstName, lastName, hashedPassword },
        email,
      );
    }

    try {
      await this.userModel.create({
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: Role.ADMIN,
        isActive: true,
        isDeleted: false,
        deletedAt: null,
      });
      this.logger.log(`${SEED_MESSAGES.ADMIN_CREATED}: ${email}`);
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        this.logger.warn(SEED_MESSAGES.DUPLICATE_EMAIL);
        return;
      }
      throw error;
    }
  }

  private async restoreAdmin(
    user: User,
    data: { firstName: string; lastName: string; hashedPassword: string },
    email: string,
  ): Promise<void> {
    if (user.role !== Role.ADMIN) {
      throw new Error(SEED_MESSAGES.EMAIL_TAKEN_BY_OTHER_ROLE);
    }

    user.firstName = data.firstName;
    user.lastName = data.lastName;
    user.password = data.hashedPassword;
    user.isActive = true;
    user.isDeleted = false;
    user.deletedAt = null;
    await user.save();

    this.logger.log(`${SEED_MESSAGES.ADMIN_RESTORED}: ${email}`);
  }

  private getRequired(key: 'SEED_ADMIN_EMAIL' | 'SEED_ADMIN_PASSWORD'): string {
    const value = this.configService.get<string>(key)?.trim();

    if (!value) {
      throw new Error(
        key === 'SEED_ADMIN_EMAIL'
          ? SEED_MESSAGES.EMAIL_MISSING
          : SEED_MESSAGES.PASSWORD_MISSING,
      );
    }

    return value;
  }

  private getOptional(key: string): string | undefined {
    const value = this.configService.get<string>(key)?.trim();
    return value || undefined;
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return (error as { code?: number })?.code === 11000;
  }
}
