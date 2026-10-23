interface HtmlTemplateOptions {
  token: string;
  FRONT_URL: string;
  bannerUrl: string;
  to: string;
}

export class EmailsTemplates {
  static getResetPasswordTemplate({
    token,
    FRONT_URL,
    bannerUrl,
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
            .email-banner {
              display: block;
              width: 100%;
              max-width: 420px;
              height: auto;
              margin: 0 auto 18px;
              border-radius: 12px 12px 0 0;
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
              <img src="${bannerUrl}" alt="Veterinaria" class="email-banner" width="420" />
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
