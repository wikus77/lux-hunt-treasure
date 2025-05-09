
/**
 * Verification email template generator
 */

/**
 * Generates HTML content for email verification
 */
export const generateVerificationEmailHtml = (name: string, verificationLink: string): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Verifica il tuo indirizzo email</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            background-color: #0a0a0a;
            color: #ffffff;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #0a0a0a;
          }
          .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 1px solid #333;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
          }
          .blue-text {
            color: #00E5FF;
          }
          .content {
            padding: 30px 0;
          }
          .button {
            display: inline-block;
            background: linear-gradient(90deg, #00E5FF 0%, #0077FF 100%);
            color: #000000;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 50px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
          }
          .footer {
            text-align: center;
            padding-top: 30px;
            font-size: 12px;
            color: #888;
            border-top: 1px solid #333;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo"><span class="blue-text">M1</span>SSION</div>
          </div>
          <div class="content">
            <h1>Ciao ${name},</h1>
            <p>Grazie per esserti registrato su M1SSION. Per completare la registrazione e attivare il tuo account, verifica il tuo indirizzo email:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" class="button">VERIFICA EMAIL</a>
            </div>
            
            <p>Se il pulsante non funziona, copia e incolla questo link nel tuo browser:</p>
            <p style="word-break: break-all; background: rgba(255,255,255,0.1); padding: 10px; border-radius: 4px;">${verificationLink}</p>
            
            <p>Questo link scadrà tra 24 ore. Se hai bisogno di un nuovo link di verifica, accedi al sito e richiedi un nuovo link.</p>
            
            <p>Grazie,<br>Il Team di M1SSION</p>
          </div>
          <div class="footer">
            <p>&copy; 2025 M1SSION. Tutti i diritti riservati.</p>
            <p>Se non hai richiesto questa email, puoi ignorarla in sicurezza.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};
