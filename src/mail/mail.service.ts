import { Injectable } from '@nestjs/common';
import { MailProvider } from './providers/mail/mail-provider';
import { SendMailOptions } from './interfaces/sendMail';

@Injectable()
export class MailService {
  constructor(private readonly mailProvider: MailProvider) {}

  async sendEmail(options: SendMailOptions) {
    return await this.mailProvider.sendEmail(options);
  }
}
