import { EmailsTemplates } from 'src/mail/templates/emails.templates';

interface PropsOptionsEmail {
  token: string;
  email: string;
  FRONT_URL: string;
  WEBSERVICE_URL: string;
}

export const getTemplateEmail = ({
  token,
  FRONT_URL,
  WEBSERVICE_URL,
  email,
}: PropsOptionsEmail): string => {
  const bannerUrl = `${WEBSERVICE_URL.replace(/\/+$/, '')}/public/bg-banner.svg`;
  return EmailsTemplates.getResetPasswordTemplate({
    token,
    FRONT_URL,
    bannerUrl,
    to: email,
  });
};
