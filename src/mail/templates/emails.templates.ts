interface HtmlTemplateOptions {
  token: string;
  FRONT_URL: string;
  to: string;
}

export class EmailsTemplates {
  static getConfirmationTemplate({
    token,
    FRONT_URL,
    to,
  }: HtmlTemplateOptions): string {
    return `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <title>Confirma tu cuenta</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <style>
            .container {
              max-width: 480px;
              margin: 0 auto;
              background: #fff;
              border-radius: 8px;
              box-shadow: 0 2px 8px rgba(0,0,0,0.08);
              padding: 32px 24px;
              font-family: 'Segoe UI', Arial, sans-serif;
              color: #333;
            }
            .logo {
              display: block;
              margin: 0 auto 24px auto;
              width: 80px;
            }
            .btn {
              display: inline-block;
              background: #4caf50;
              color: #fff !important;
              padding: 12px 32px;
              border-radius: 6px;
              text-decoration: none;
              font-weight: bold;
              margin-top: 24px;
              transition: background 0.2s;
            }
            .btn:hover {
              background: #388e3c;
            }
            .footer {
              margin-top: 32px;
              font-size: 12px;
              color: #888;
              text-align: center;
            }
          </style>
        </head>
        <body style="background: #f4f6f8; padding: 32px 0;">
          <div class="container">
            <img src="https://cdn-icons-png.flaticon.com/512/616/616408.png" alt="Veterinaria" class="logo" />
            <h2>¡Bienvenido a Veterinaria!</h2>
            <p>
              Gracias señor(a) <span style="font-weight:bold;">${to}</span> por registrarte. Para activar tu cuenta, por favor haz clic en el siguiente botón y digite el siguiente código: <span style="font-weight:bold;">${token}</span>
            </p>
            <a
              href="${FRONT_URL}/auth/confirm?token=${token}"
              class="btn"
              target="_blank"
            >Confirmar cuenta</a>
            <p style="margin-top: 24px;">
              Si no creaste esta cuenta, puedes ignorar este correo.
            </p>
            <div class="footer">
              Veterinaria &copy; ${new Date().getFullYear()}<br>
              Este es un mensaje automático, por favor no respondas a este correo.
            </div>
          </div>
        </body>
      </html>
    `;
  }

  static getResendConfirmationTemplate({
    token,
    FRONT_URL,
    to,
  }: HtmlTemplateOptions): string {
    return `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Reenvío de Token de Confirmación</title>
          <style>
            body {
              background: #f4f6f8;
              font-family: 'Segoe UI', Arial, sans-serif;
              margin: 0;
              padding: 0;
            }
            .container {
              background: #fff;
              max-width: 480px;
              margin: 40px auto;
              border-radius: 12px;
              box-shadow: 0 4px 24px rgba(0,0,0,0.08);
              padding: 40px 32px 32px 32px;
            }
            .logo {
              display: block;
              margin: 0 auto 24px auto;
              width: 80px;
            }
            h2 {
              color: #4caf50;
              text-align: center;
              margin-bottom: 16px;
            }
            p {
              color: #333;
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 16px;
              text-align: center;
            }
            .token {
              display: inline-block;
              background: #e8f5e9;
              color: #388e3c;
              font-size: 20px;
              font-weight: bold;
              padding: 10px 24px;
              border-radius: 8px;
              margin: 16px 0;
              letter-spacing: 2px;
            }
            .btn {
              display: inline-block;
              background: #4caf50;
              color: #fff !important;
              padding: 14px 36px;
              border-radius: 6px;
              text-decoration: none;
              font-weight: bold;
              margin: 24px auto 0 auto;
              transition: background 0.2s;
              font-size: 16px;
            }
            .btn:hover {
              background: #388e3c;
            }
            .footer {
              margin-top: 32px;
              font-size: 12px;
              color: #888;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="https://cdn-icons-png.flaticon.com/512/616/616408.png" alt="Veterinaria" class="logo" />
            <h2>Reenvío de Token de Confirmación</h2>
            <p>
              Hola <span style="font-weight:bold;">${to}</span>,<br>
              Has solicitado reenviar tu token de confirmación.<br>
              Por favor, utiliza el siguiente código para confirmar tu cuenta:
            </p>
            <div class="token">${token}</div>
            <p>
              También puedes confirmar tu cuenta haciendo clic en el siguiente botón:
            </p>
            <a
              href="${FRONT_URL}/confirmar?token=${token}"
              class="btn"
              target="_blank"
            >Confirmar cuenta</a>
            <p style="margin-top: 24px;">
              Si no solicitaste este correo, puedes ignorarlo con seguridad.
            </p>
            <div class="footer">
              Veterinaria &copy; ${new Date().getFullYear()}<br>
              Este es un mensaje automático, por favor no respondas a este correo.
            </div>
          </div>
        </body>
      </html>
    `;
  }

  static getResetPasswordTemplate({
    token,
    FRONT_URL,
    to,
  }: HtmlTemplateOptions): string {
    return `
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Recuperación de contraseña</title>
          <style>
            body {
              background: #f4f6fb;
              font-family: 'Segoe UI', Arial, sans-serif;
              margin: 0;
              padding: 0;
            }
            .container {
              max-width: 420px;
              margin: 40px auto;
              background: #fff;
              border-radius: 12px;
              box-shadow: 0 4px 24px rgba(0,0,0,0.08);
              padding: 32px 28px 24px 28px;
              text-align: center;
            }
            .logo {
              width: 64px;
              margin-bottom: 18px;
            }
            h2 {
              color: #1976d2;
              margin-bottom: 10px;
              font-weight: 700;
            }
            p {
              color: #444;
              font-size: 16px;
              margin: 16px 0 0 0;
            }
            .token {
              display: inline-block;
              background: #e3f2fd;
              color: #1976d2;
              font-size: 28px;
              font-weight: bold;
              letter-spacing: 4px;
              border-radius: 8px;
              padding: 12px 32px;
              margin: 22px 0 18px 0;
              box-shadow: 0 2px 8px rgba(25, 118, 210, 0.08);
            }
            .btn {
              display: inline-block;
              background: #1976d2;
              color: #fff !important;
              text-decoration: none;
              padding: 12px 32px;
              border-radius: 6px;
              font-size: 16px;
              font-weight: 600;
              margin-top: 18px;
              transition: background 0.2s;
              box-shadow: 0 2px 8px rgba(25, 118, 210, 0.08);
            }
            .btn:hover {
              background: #1565c0;
            }
            .footer {
              margin-top: 32px;
              font-size: 12px;
              color: #888;
              text-align: center;
            }
            </style>
          </head>
          <body>
            <div class="container">
              <img src="https://cdn-icons-png.flaticon.com/512/616/616408.png" alt="Veterinaria" class="logo" />
              <h2>Recuperación de contraseña</h2>
              <p>
                Hola <span style="font-weight:bold;">${to}</span>,<br>
                Has solicitado restablecer tu contraseña.<br>
                Por favor, utiliza el siguiente código para restablecer tu contraseña:
              </p>
              <div class="token">${token}</div>
              <p>
                También puedes restablecer tu contraseña haciendo clic en el siguiente botón:
              </p>
              <a
                href="${FRONT_URL}/auth/reset-password?token=${token}"
                class="btn"
                target="_blank"
              >Restablecer contraseña</a>
              <p style="margin-top: 24px;">
                Si no solicitaste este correo, puedes ignorarlo con seguridad.
              </p>
              <div class="footer">
                Veterinaria &copy; ${new Date().getFullYear()}<br>
                Este es un mensaje automático, por favor no respondas a este correo.
              </div>
            </div>
          </body>
          </style>
        </head>
      </html>
    `;
  }
}
