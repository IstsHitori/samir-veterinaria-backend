import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { CommonModule } from 'src/common/common.module';
import { UserModule } from 'src/user/user.module';
import { ENCRYPTION_SERVICE } from 'src/common/interfaces/Encryption-service.interface';
import { BcryptAdapter } from 'src/common/adapters/bcrypt-adapter';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: ENCRYPTION_SERVICE,
      useClass: BcryptAdapter,
    },
  ],
  imports: [CommonModule, UserModule],
})
export class AuthModule {}
