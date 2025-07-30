/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendMailOptions } from 'src/mail/interfaces/sendMail';

@Injectable()
export class MailProvider {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: this.configService.get<string>('MAILER_SERVICE'),
      auth: {
        user: this.configService.get<string>('MAILER_EMAIL'),
        pass: this.configService.get<string>('MAILER_SECRET_KEY'),
      },
    });
  }

  async sendEmail(options: SendMailOptions): Promise<boolean> {
    try {
      const { to, subject, htmlBody } = options;

      await this.transporter.sendMail({
        to,
        subject,
        html: htmlBody,
      });

      return true;
    } catch (error) {
      return false;
    }
  }
}
