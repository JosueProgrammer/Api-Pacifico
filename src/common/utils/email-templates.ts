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
          <title>Recuperación de Contraseña - CUR-CARAZO</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
              min-height: 100vh;
              padding: 20px;
            }
            
            .container {
              max-width: 600px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 15px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.2);
              overflow: hidden;
            }
            
            .header {
              background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
              color: white;
              text-align: center;
              padding: 30px 20px;
              position: relative;
            }
            
            .logo-container {
              margin-bottom: 20px;
            }
            
            .logo {
              width: 80px;
              height: 80px;
              border-radius: 50%;
              border: 3px solid rgba(255,255,255,0.3);
              display: block;
              margin: 0 auto;
              object-fit: cover; 
              object-position: center; /* CENTRA la imagen dentro del círculo */
            }
            
            .header h1 {
              font-size: 28px;
              margin-bottom: 10px;
              font-weight: 600;
            }
            
            .header p {
              font-size: 16px;
              opacity: 0.9;
            }
            
            .content {
              padding: 40px 30px;
            }
            
            .greeting {
              font-size: 18px;
              margin-bottom: 20px;
              color: #2c3e50;
            }
            
            .description {
              font-size: 16px;
              color: #555;
              margin-bottom: 30px;
              line-height: 1.8;
            }
            
            .code-container {
              text-align: center;
              margin: 40px 0;
              padding: 30px;
              background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
              border-radius: 12px;
              box-shadow: 0 5px 15px rgba(0,0,0,0.1);
              position: relative;
              overflow: hidden;
            }
            
            .code-container::before {
              content: '';
              position: absolute;
              top: -50%;
              left: -50%;
              width: 200%;a
              height: 200%;
              background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
              animation: shine 3s infinite;
            }
            
            @keyframes shine {
              0% { transform: translateX(-100%) translateY(-100%) rotate(45deg); }
              100% { transform: translateX(100%) translateY(100%) rotate(45deg); }
            }
            
            .code-label {
              color: white;
              font-size: 16px;
              margin-bottom: 15px;
              font-weight: 500;
              position: relative;
              z-index: 1;
            }
            
            .code {
              font-size: 48px;
              font-weight: bold;
              color: white;
              letter-spacing: 8px;
              font-family: 'Courier New', monospace;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
              position: relative;
              z-index: 1;
            }
            
            .warning {
              background: #fff3cd;
              border-left: 4px solid #ffc107;
              padding: 20px;
              border-radius: 8px;
              margin: 30px 0;
            }
            
            .warning h3 {
              color: #856404;
              margin-bottom: 10px;
              font-size: 16px;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            
            .warning ul {
              color: #856404;
              padding-left: 20px;
            }
            
            .warning li {
              margin-bottom: 5px;
            }
            
            .footer {
              background: #f8f9fa;
              padding: 25px 30px;
              text-align: center;
              border-top: 1px solid #e9ecef;
            }
            
            .footer p {
              color: #6c757d;
              font-size: 14px;
              margin-bottom: 5px;
            }
            
            .footer .copyright {
              margin-top: 15px;
              padding-top: 15px;
              border-top: 1px solid #dee2e6;
              font-size: 12px;
              color: #adb5bd;
            }
            
            @media (max-width: 600px) {
              .container {
                margin: 10px;
                border-radius: 10px;
              }
              
              .header {
                padding: 20px 15px;
              }
              
              .header h1 {
                font-size: 24px;
              }
              
              .content {
                padding: 30px 20px;
              }
              
              .code {
                font-size: 36px;
                letter-spacing: 6px;
              }
              
              .logo {
                width: 60px;
                height: 60px;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo-container">
                <img src="https://managuafc.com/wp-content/uploads/2018/11/Unan-Managua-1.png" 
                     alt="CUR-CARAZO Logo" class="logo"/>
              </div>
              <h1>🔐 Recuperación de Contraseña</h1>
              <p>CUR-CARAZO - Sistema de Horarios Académicos</p>
            </div>
            
            <div class="content">
              <div class="greeting">
                Hola <strong>${userName}</strong>,
              </div>
              
              <div class="description">
                Has solicitado restablecer tu contraseña en el Sistema de Horarios del CUR-CARAZO. 
                Para continuar con el proceso, utiliza el código de verificación que aparece a continuación.
              </div>
              
              <div class="code-container">
                <div class="code-label">Tu código de verificación es:</div>
                <div class="code">${code}</div>
              </div>
              
              <div class="warning">
                <h3>⚠️ Información Importante:</h3>
                <ul>
                  <li>Este código expira en <strong>10 minutos</strong></li>
                  <li>No compartas este código con nadie</li>
                  <li>Si no solicitaste este cambio, ignora este email</li>
                  <li>El código solo puede ser utilizado una vez</li>
                </ul>
              </div>
              
              <div class="description">
                Ingresa este código en la página de restablecimiento de contraseña para continuar con el proceso. 
                Si tienes problemas o no solicitaste este cambio, contacta inmediatamente al administrador del sistema.
              </div>
            </div>
            
            <div class="footer">
              <p><strong>CUR-CARAZO - Sistema de Horarios Académicos</strong></p>
              <p>Este es un email automático, por favor no respondas a este mensaje.</p>
              <div class="copyright">
                © ${new Date().getFullYear()} Centro Universitario Regional de Carazo. Todos los derechos reservados.
              </div>
            </div>
          </div>
        </body>
        </html>
      `;
    }
}
