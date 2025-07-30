import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailProvider } from './providers/mail/mail-provider';

@Module({
  providers: [MailService, MailProvider],
  exports: [MailService],
})
export class MailModule {}
