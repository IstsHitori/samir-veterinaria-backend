import { getTemplateEmail } from './get-options-email';
import { EMAIL_TYPE } from 'src/mail/interfaces/email-type';

const base = {
  token: '123456',
  email: 'ana@test.com',
  FRONT_URL: 'http://front.test',
};

describe('getTemplateEmail', () => {
  it('genera el template de confirmación de cuenta', () => {
    const html = getTemplateEmail({
      ...base,
      emailType: EMAIL_TYPE.CONFIRM_ACCOUNT,
    });

    expect(html).toContain('123456');
    expect(html).toContain('http://front.test');
  });

  it('genera el template de reenvío de confirmación', () => {
    const html = getTemplateEmail({
      ...base,
      emailType: EMAIL_TYPE.RESEND_CONFIRM_ACCOUNT,
    });

    expect(html).toContain('123456');
    expect(html).toContain('Reenvío');
  });

  it('genera el template de recuperación de contraseña', () => {
    const html = getTemplateEmail({
      ...base,
      emailType: EMAIL_TYPE.RESET_PASSWORD,
    });

    expect(html).toContain('123456');
    expect(html).toContain('http://front.test');
  });
});
