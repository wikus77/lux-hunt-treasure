
/**
 * Email template generator functions
 */

/**
 * Generates HTML content for welcome emails
 */
export const generateWelcomeEmailHtml = (name: string, launchDate: string = '19 Giugno 2025'): string => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Benvenuto in M1SSION</title>
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
          .countdown {
            text-align: center;
            padding: 15px;
            margin: 20px 0;
            border: 1px solid #333;
            border-radius: 8px;
            background-color: rgba(0, 229, 255, 0.05);
          }
          .referral-code {
            text-align: center;
            padding: 15px;
            margin: 20px 0;
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 2px;
            color: #00E5FF;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo"><span class="blue-text">M1</span>SSION</div>
          </div>
          <div class="content">
            <h1>Benvenuto, ${name}!</h1>
            <p>Grazie per esserti pre-iscritto a M1SSION. Sei ufficialmente parte di questa avventura esclusiva.</p>
            
            <div class="countdown">
              <h3>La sfida inizia il ${launchDate}</h3>
              <p>Riceverai aggiornamenti esclusivi 15 giorni, 7 giorni, 3 giorni e 24 ore prima del lancio.</p>
            </div>
            
            {{#if referral_code}}
            <p>Ecco il tuo codice di invito personale. Condividilo con i tuoi amici per guadagnare crediti bonus:</p>
            <div class="referral-code">{{referral_code}}</div>
            {{/if}}
            
            <p>Preparati per:</p>
            <ul>
              <li>Enigmi da risolvere in tempo reale</li>
              <li>Indizi esclusivi riservati agli iscritti alla newsletter</li>
              <li>La possibilità di vincere premi straordinari</li>
            </ul>
            
            <p>Ricorda: <strong>IT IS POSSIBLE</strong></p>
            
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

/**
 * Generates HTML content for notification emails
 */
export const generateNotificationEmailHtml = (subject: string, message: string): string => {
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
            <h1>Aggiornamento M1SSION</h1>
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
