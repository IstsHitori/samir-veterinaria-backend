import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { CommonModule } from 'src/common/common.module';
import { UserModule } from 'src/user/user.module';
import { ENCRYPTION_SERVICE } from 'src/common/interfaces/Encryption-service.interface';
import { BcryptAdapter } from 'src/common/adapters/bcrypt-adapter';
import { MailModule } from 'src/mail/mail.module';
import { TokenModule } from 'src/token/token.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategie';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: ENCRYPTION_SERVICE,
      useClass: BcryptAdapter,
    },
    JwtStrategy,
  ],
  imports: [
    CommonModule,
    UserModule,
    MailModule,
    TokenModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get<string>('JWT_SEED'),
          signOptions: {
            expiresIn: '2h',
          },
        };
      },
    }),
  ],
  exports: [JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
