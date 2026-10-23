import { EmailsTemplates } from './emails.templates';

const options = {
  token: '123456',
  FRONT_URL: 'http://front.test',
  bannerUrl: 'https://api.test/public/bg-banner.svg',
  to: 'ana@test.com',
};

describe('EmailsTemplates', () => {
  it('getResetPasswordTemplate incluye token, url y destinatario', () => {
    const html = EmailsTemplates.getResetPasswordTemplate(options);

    expect(html).toContain('123456');
    expect(html).toContain('http://front.test');
    expect(html).toContain('ana@test.com');
    expect(html).toContain('src="https://api.test/public/bg-banner.svg"');
  });
});
