
import { baseStyles } from './baseStyles';

export type PreRegistrationEmailData = {
  name: string;
  referral_code: string;
};

export const generatePreRegistrationEmailHtml = (data: PreRegistrationEmailData): string => {
  const { name, referral_code } = data;
  
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <style>
      ${baseStyles.darkTheme}
      .referral-code {
        background-color: #111;
        border: 1px solid #333;
        border-radius: 4px;
        padding: 10px 20px;
        font-size: 18px;
        font-weight: bold;
        color: #00E5FF;
        text-align: center;
        margin: 20px 0;
        letter-spacing: 2px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <div class="logo"><span class="blue-text">M1</span>SSION</div>
      </div>
      
      <div class="content">
        <h1>Benvenuto in M1SSION, ${name}!</h1>
        
        <p>La tua pre-registrazione è stata confermata.</p>
        
        <p>Ti diamo il benvenuto nel nostro esclusivo programma di pre-lancio. Preparati ad entrare in un mondo dove le tue capacità di osservazione e deduzione saranno messe alla prova.</p>
        
        <p>Sei stato selezionato tra i primi 100 utenti e hai ricevuto <strong>100 crediti bonus</strong> che potrai utilizzare quando il gioco sarà online.</p>
        
        <h3>Il tuo codice referral esclusivo:</h3>
        
        <div class="referral-code">${referral_code}</div>
        
        <p>Condividi questo codice con i tuoi amici. Per ogni amico che si iscrive usando il tuo codice, guadagnerai <strong>50 crediti extra</strong>!</p>
        
        <p>Resta sintonizzato per ulteriori aggiornamenti. Il lancio è imminente.</p>
        
        <a href="${process.env.VITE_APP_URL || 'https://m1ssion.com'}" class="button">Visita il nostro sito</a>
      </div>
      
      <div class="footer">
        <p>&copy; 2025 M1SSION. Tutti i diritti riservati.</p>
        <p>Questo messaggio è stato inviato a seguito della tua registrazione su M1SSION.</p>
      </div>
    </div>
  </body>
  </html>
  `;
};
