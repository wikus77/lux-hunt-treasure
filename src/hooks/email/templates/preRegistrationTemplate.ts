
/**
 * Generate HTML for pre-registration confirmation email
 */
export const generatePreRegistrationEmailHtml = (
  name: string,
  referralCode: string
) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Registrazione Confermata</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #000;
            border-radius: 8px;
            color: #fff;
          }
          .header {
            background: linear-gradient(90deg, #000 0%, #111 100%);
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            padding: 20px;
          }
          .footer {
            background-color: #111;
            padding: 15px;
            text-align: center;
            font-size: 12px;
            color: #aaa;
            border-radius: 0 0 8px 8px;
          }
          h1 {
            color: #00E5FF;
            margin-bottom: 20px;
          }
          h2 {
            color: #fff;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(90deg, #00E5FF 0%, #0077FF 100%);
            color: #000;
            text-decoration: none;
            font-weight: bold;
            border-radius: 30px;
            margin: 20px 0;
          }
          .code-box {
            background-color: #222;
            border: 1px solid #444;
            padding: 15px;
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            border-radius: 4px;
            margin: 20px 0;
            color: #00E5FF;
            letter-spacing: 2px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 1px;
          }
          .logo .blue {
            color: #00E5FF;
          }
          .logo .white {
            color: #fff;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <a href="https://m1ssion.com" style="text-decoration: none; color: inherit;">
              <div class="logo">
                <span class="blue">M1</span><span class="white">SSION</span>
              </div>
            </a>
          </div>
          <div class="content">
            <h1>Grazie per esserti registrato, ${name}!</h1>
            <p>La tua pre-registrazione a M1SSION è stata confermata. Ti terremo aggiornato su tutte le novità e sarai tra i primi a sapere quando il gioco sarà disponibile.</p>
            
            <h2>Il tuo codice di referral personale:</h2>
            <div class="code-box">${referralCode}</div>
            
            <p>Condividi questo codice con i tuoi amici. Per ogni amico che si registra usando il tuo codice, entrambi riceverete crediti extra all'inizio del gioco!</p>
            
            <a href="https://m1ssion.com" class="button">Torna al sito</a>
            
            <p>Ricorda che M1SSION è un'esperienza unica che combina caccia al tesoro, strategia e premi reali. Preparati a metterti alla prova!</p>
          </div>
          <div class="footer">
            <p>© 2025 M1SSION. Tutti i diritti riservati.</p>
            <p>
              <a href="https://m1ssion.com/privacy" style="color: #aaa; margin: 0 10px;">Privacy Policy</a> | 
              <a href="https://m1ssion.com/terms" style="color: #aaa; margin: 0 10px;">Termini e Condizioni</a>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;
};
