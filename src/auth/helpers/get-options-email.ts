import { EMAIL_TYPE } from 'src/mail/interfaces/email-type';
import { EmailsTemplates } from 'src/mail/templates/emails.templates';

interface PropsOptionsEmail {
  token: string;
  email: string;
  FRONT_URL: string;
  WEBSERVICE_URL: string;
  emailType: EMAIL_TYPE;
}

export const getTemplateEmail = ({
  token,
  FRONT_URL,
  WEBSERVICE_URL,
  email,
  emailType,
}: PropsOptionsEmail): string => {
  let template: string = '';
  const bannerUrl = `${WEBSERVICE_URL.replace(/\/+$/, '')}/public/bg-banner.svg`;

  switch (emailType) {
    case EMAIL_TYPE.CONFIRM_ACCOUNT:
      template = EmailsTemplates.getConfirmationTemplate({
        token,
        FRONT_URL,
        bannerUrl,
        to: email,
      });
      break;
    case EMAIL_TYPE.RESEND_CONFIRM_ACCOUNT:
      template = EmailsTemplates.getResendConfirmationTemplate({
        token,
        FRONT_URL,
        bannerUrl,
        to: email,
      });
      break;
    case EMAIL_TYPE.RESET_PASSWORD:
      template = EmailsTemplates.getResetPasswordTemplate({
        token,
        FRONT_URL,
        bannerUrl,
        to: email,
      });
      break;
  }

  return template;
};
