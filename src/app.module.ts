import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { TokenModule } from './token/token.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CommonModule } from './common/common.module';
import { MailModule } from './mail/mail.module';
import { PatientModule } from './patient/patient.module';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        MONGODB: Joi.string().required(),
        JWT_SEED: Joi.string().required(),
        MAILER_SERVICE: Joi.string().required(),
        MAILER_EMAIL: Joi.string().email().required(),
        MAILER_SECRET_KEY: Joi.string().required(),
        WEBSERVICE_URL: Joi.string().uri().required(),
        FRONT_URL: Joi.string().uri().required(),
      }),
    }),
    MongooseModule.forRoot(process.env.MONGODB!),
    AuthModule,
    UserModule,
    TokenModule,
    CommonModule,
    MailModule,
    PatientModule,
  ],
})
export class AppModule {}
