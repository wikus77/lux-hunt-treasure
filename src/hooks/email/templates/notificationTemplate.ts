
/**
 * Notification email template generator
 */

/**
 * Generates HTML content for notification emails
 */
export const generateNotificationEmailHtml = (name: string, message: string): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Aggiornamento M1SSION</title>
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
          .message {
            padding: 15px;
            margin: 20px 0;
            border-left: 4px solid #00E5FF;
            background-color: rgba(0, 229, 255, 0.05);
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
            <p>Abbiamo un importante aggiornamento per te riguardo M1SSION.</p>
            
            <div class="message">
              ${message}
            </div>
            
            <div style="text-align: center;">
              <a href="https://m1ssion.com" class="button">VISITA IL SITO</a>
            </div>
          </div>
          <div class="footer">
            <p>&copy; 2025 M1SSION. Tutti i diritti riservati.</p>
            <p>Per annullare l'iscrizione, rispondi a questa email con oggetto "CANCELLA".</p>
          </div>
        </div>
      </body>
    </html>
  `;
};
