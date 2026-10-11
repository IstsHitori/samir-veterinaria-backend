import { EmailsTemplates } from './emails.templates';

const options = {
  token: '123456',
  FRONT_URL: 'http://front.test',
  to: 'ana@test.com',
};

describe('EmailsTemplates', () => {
  it('getConfirmationTemplate incluye token, url y destinatario', () => {
    const html = EmailsTemplates.getConfirmationTemplate(options);

    expect(html).toContain('123456');
    expect(html).toContain('http://front.test');
    expect(html).toContain('ana@test.com');
  });

  it('getResendConfirmationTemplate incluye token, url y destinatario', () => {
    const html = EmailsTemplates.getResendConfirmationTemplate(options);

    expect(html).toContain('123456');
    expect(html).toContain('http://front.test');
    expect(html).toContain('ana@test.com');
  });

  it('getResetPasswordTemplate incluye token, url y destinatario', () => {
    const html = EmailsTemplates.getResetPasswordTemplate(options);

    expect(html).toContain('123456');
    expect(html).toContain('http://front.test');
    expect(html).toContain('ana@test.com');
  });
});
