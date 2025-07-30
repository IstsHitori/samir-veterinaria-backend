import { EMAIL_TYPE } from 'src/mail/interfaces/email-type';
import { EmailsTemplates } from 'src/mail/templates/emails.templates';

interface PropsOptionsEmail {
  token: string;
  email: string;
  FRONT_URL: string;
  emailType: EMAIL_TYPE;
}

export const getTemplateEmail = ({
  token,
  FRONT_URL,
  email,
  emailType,
}: PropsOptionsEmail): string => {
  let template: string = '';

  switch (emailType) {
    case EMAIL_TYPE.CONFIRM_ACCOUNT:
      template = EmailsTemplates.getConfirmationTemplate({
        token,
        FRONT_URL,
        to: email,
      });
      break;
    case EMAIL_TYPE.RESEND_CONFIRM_ACCOUNT:
      template = EmailsTemplates.getResendConfirmationTemplate({
        token,
        FRONT_URL,
        to: email,
      });
      break;
    case EMAIL_TYPE.RESET_PASSWORD:
      template = EmailsTemplates.getResetPasswordTemplate({
        token,
        FRONT_URL,
        to: email,
      });
      break;
  }

  return template;
};
