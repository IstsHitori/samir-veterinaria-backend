import { MailService } from './mail.service';

describe('MailService', () => {
  let mailProvider: { sendEmail: jest.Mock };
  let service: MailService;

  beforeEach(() => {
    mailProvider = { sendEmail: jest.fn() };
    service = new MailService(mailProvider as any);
  });

  it('delega el envío en el provider y retorna su resultado', async () => {
    const options = { to: 'a@a.com', subject: 'Hola', htmlBody: '<p>x</p>' };
    mailProvider.sendEmail.mockResolvedValue(true);

    await expect(service.sendEmail(options)).resolves.toBe(true);
    expect(mailProvider.sendEmail).toHaveBeenCalledWith(options);
  });

  it('propaga false cuando el provider falla', async () => {
    mailProvider.sendEmail.mockResolvedValue(false);

    await expect(
      service.sendEmail({ to: 'a@a.com', subject: 'x', htmlBody: 'y' }),
    ).resolves.toBe(false);
  });
});
