jest.mock('nodemailer');

import * as nodemailer from 'nodemailer';
import { MailProvider } from './mail-provider';

describe('MailProvider', () => {
  let configService: { get: jest.Mock };
  let sendMail: jest.Mock;
  let createTransport: jest.Mock;

  beforeEach(() => {
    sendMail = jest.fn().mockResolvedValue(undefined);
    createTransport = nodemailer.createTransport as unknown as jest.Mock;
    createTransport.mockReset();
    createTransport.mockReturnValue({ sendMail });

    configService = {
      get: jest.fn(
        (key: string) =>
          ({
            MAILER_SERVICE: 'gmail',
            MAILER_EMAIL: 'me@test.com',
            MAILER_SECRET_KEY: 'secret',
          })[key],
      ),
    };
  });

  it('crea el transporter con la configuración del entorno', () => {
    new MailProvider(configService as any);

    expect(createTransport).toHaveBeenCalledWith({
      service: 'gmail',
      auth: { user: 'me@test.com', pass: 'secret' },
    });
  });

  it('envía un email y retorna true', async () => {
    const provider = new MailProvider(configService as any);

    const result = await provider.sendEmail({
      to: 'a@a.com',
      subject: 'Hola',
      htmlBody: '<p>x</p>',
    });

    expect(result).toBe(true);
    expect(sendMail).toHaveBeenCalledWith({
      to: 'a@a.com',
      subject: 'Hola',
      html: '<p>x</p>',
    });
  });

  it('retorna false cuando el envío falla', async () => {
    sendMail.mockRejectedValue(new Error('boom'));
    const provider = new MailProvider(configService as any);

    await expect(
      provider.sendEmail({ to: 'a@a.com', subject: 'x', htmlBody: 'y' }),
    ).resolves.toBe(false);
  });
});
