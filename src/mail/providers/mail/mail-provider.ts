import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { SendMailOptions } from 'src/mail/interfaces/sendMail';

@Injectable()
export class MailProvider implements OnModuleInit {
  private readonly logger = new Logger(MailProvider.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;

  constructor(private configService: ConfigService) {
    const service = this.configService.get<string>('MAILER_SERVICE') ?? 'gmail';
    const user = this.configService.get<string>('MAILER_EMAIL') ?? '';
    // Gmail muestra la contraseña de aplicación con espacios ("abcd efgh ...");
    // si se copia tal cual, la autenticación falla.
    const pass = (
      this.configService.get<string>('MAILER_SECRET_KEY') ?? ''
    ).replace(/\s+/g, '');
    this.from = user;

    this.transporter = nodemailer.createTransport({
      service,
      auth: {
        user,
        pass,
      },
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 20_000,
    });
  }

  async onModuleInit() {
    try {
      await this.transporter.verify();
      this.logger.log('Conexión SMTP verificada correctamente');
    } catch (error) {
      this.logger.error(
        `No se pudo conectar al servidor SMTP: ${
          error instanceof Error ? error.message : String(error)
        }. Revisa MAILER_SERVICE, MAILER_EMAIL y MAILER_SECRET_KEY (Gmail requiere una contraseña de aplicación).`,
      );
    }
  }

  async sendEmail(options: SendMailOptions): Promise<boolean> {
    const { to, subject, htmlBody } = options;

    try {
      await this.transporter.sendMail({
        from: `"Veterinaria Samir" <${this.from}>`,
        to,
        subject,
        html: htmlBody,
      });

      return true;
    } catch (error) {
      this.logger.error(
        `Error al enviar el correo a ${to}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return false;
    }
  }
}
