export class EmailTemplates {
    /**
     * Genera el template HTML para el email de recuperación de contraseña
     * @param code - Código de 4 dígitos
     * @param userName - Nombre del usuario
     * @returns HTML del email
     */
    static generatePasswordResetEmail(code: string, userName: string): string {
        return `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Recuperación de Contraseña - El Pacifico</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background-color: #f3f8fb;
              min-height: 100vh;
              padding: 20px;
            }
            
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 20px;
              box-shadow: 0 15px 35px rgba(0, 114, 181, 0.08);
              overflow: hidden;
            }
            
            .header {
              background: linear-gradient(135deg, #09203f 0%, #00b4db 100%);
              color: white;
              text-align: center;
              padding: 40px 20px;
              position: relative;
            }
            
            .logo-container {
              margin-bottom: 20px;
              display: inline-block;
              background: rgba(255, 255, 255, 0.15);
              padding: 15px;
              border-radius: 50%;
              backdrop-filter: blur(5px);
            }
            
            .logo-text {
              font-size: 28px;
              font-weight: 900;
              letter-spacing: 2px;
              color: #ffffff;
              text-shadow: 0 2px 10px rgba(0,0,0,0.2);
            }
            
            .header h1 {
              font-size: 26px;
              margin-bottom: 5px;
              font-weight: 700;
              letter-spacing: 0.5px;
            }
            
            .header p {
              font-size: 15px;
              opacity: 0.85;
              font-weight: 300;
            }
            
            .content {
              padding: 45px 35px;
            }
            
            .greeting {
              font-size: 20px;
              margin-bottom: 15px;
              color: #1a2a3a;
              font-weight: 600;
            }
            
            .description {
              font-size: 15px;
              color: #4a5568;
              margin-bottom: 30px;
              line-height: 1.7;
            }
            
            .code-container {
              text-align: center;
              margin: 35px 0;
              padding: 35px;
              background: linear-gradient(135deg, #00b4db 0%, #0083b0 100%);
              border-radius: 16px;
              box-shadow: 0 10px 25px rgba(0, 180, 219, 0.25);
              position: relative;
            }
            
            .code-label {
              color: rgba(255, 255, 255, 0.9);
              font-size: 15px;
              margin-bottom: 10px;
              font-weight: 500;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            
            .code {
              font-size: 52px;
              font-weight: 800;
              color: white;
              letter-spacing: 12px;
              font-family: 'Courier New', monospace;
              text-shadow: 0 4px 15px rgba(0,0,0,0.2);
            }
            
            .warning {
              background: #fdf6e3;
              border-left: 4px solid #f6ad55;
              padding: 22px;
              border-radius: 8px;
              margin: 30px 0;
            }
            
            .warning h3 {
              color: #dd6b20;
              margin-bottom: 12px;
              font-size: 15px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            
            .warning ul {
              color: #7b341e;
              padding-left: 20px;
              font-size: 14px;
            }
            
            .warning li {
              margin-bottom: 8px;
            }
            
            .footer {
              background: #f8fafc;
              padding: 30px;
              text-align: center;
              border-top: 1px solid #e2e8f0;
            }
            
            .footer p {
              color: #718096;
              font-size: 13px;
              margin-bottom: 8px;
            }
            
            .footer .brand {
              color: #2d3748;
              font-weight: bold;
              font-size: 14px;
            }
            
            @media (max-width: 600px) {
              .container { margin: 0; border-radius: 12px; }
              .content { padding: 30px 20px; }
              .code { font-size: 40px; letter-spacing: 8px; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo-container">
                <div class="logo-text">🌊 EL PACÍFICO</div>
              </div>
              <h1>Recuperación de Acceso</h1>
              <p>Panel de Administración y Operaciones</p>
            </div>
            
            <div class="content">
              <div class="greeting">
                Hola, <strong>${userName}</strong>
              </div>
              
              <div class="description">
                Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en el sistema de <strong>El Pacífico</strong>.
                Para autorizar este cambio y recuperar tu acceso de forma segura, copia el siguiente código de verificación:
              </div>
              
              <div class="code-container">
                <div class="code-label">Código de Verificación</div>
                <div class="code">${code}</div>
              </div>
              
              <div class="warning">
                <h3>⚠️ Medidas de Seguridad</h3>
                <ul>
                  <li>Este código será válido únicamente por <strong>10 minutos</strong>.</li>
                  <li>Incluso nuestros técnicos no te pedirán este código. Nunca lo compartas.</li>
                  <li>Si no solicitaste este cambio de clave, puedes ignorar este correo; tu cuenta sigue segura.</li>
                </ul>
              </div>
            </div>
            
            <div class="footer">
              <p class="brand">EL PACÍFICO - ADMIN PANEL</p>
              <p>Correo generado automáticamente por los servidores de seguridad.</p>
              <p style="margin-top: 15px; font-size: 11px; opacity: 0.6;">
                © ${new Date().getFullYear()} El Pacífico. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </body>
        </html>
        `;
    }
}
