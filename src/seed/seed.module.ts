import { Module } from '@nestjs/common';
import { CommonModule } from 'src/common/common.module';
import { ENCRYPTION_SERVICE } from 'src/common/interfaces/Encryption-service.interface';
import { BcryptAdapter } from 'src/common/adapters/bcrypt-adapter';
import { UserModule } from 'src/user/user.module';
import { AdminSeedService } from './admin-seed.service';

@Module({
  imports: [UserModule, CommonModule],
  providers: [
    AdminSeedService,
    {
      provide: ENCRYPTION_SERVICE,
      useClass: BcryptAdapter,
    },
  ],
})
export class SeedModule {}
