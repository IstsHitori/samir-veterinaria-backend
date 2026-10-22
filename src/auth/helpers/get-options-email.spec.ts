import { getTemplateEmail } from './get-options-email';

const base = {
  token: '123456',
  email: 'ana@test.com',
  FRONT_URL: 'http://front.test',
  WEBSERVICE_URL: 'https://api.test/',
};

describe('getTemplateEmail', () => {
  it('genera el template de recuperación de contraseña', () => {
    const html = getTemplateEmail(base);

    expect(html).toContain('123456');
    expect(html).toContain('http://front.test');
    expect(html).toContain('src="https://api.test/public/bg-banner.svg"');
  });
});
