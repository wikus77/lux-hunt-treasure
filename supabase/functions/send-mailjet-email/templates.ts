
import { ContactData } from "./types.ts";

// Generate HTML content for contact emails
export function generateContactEmailHtml(data: ContactData): string {
  const { name, email, message } = data;
  
  // Basic styling for email template
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h2>Nuovo messaggio dal form di contatto:</h2>
      <p><strong>Nome:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Messaggio:</strong></p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
        ${message}
      </div>
      <p style="margin-top: 20px; font-size: 12px; color: #999;">
        Questo messaggio è stato inviato automaticamente dal form di contatto del sito web M1SSION.
      </p>
    </div>
  `;
}

// Generate HTML content for agent confirmation emails
export function generateAgentConfirmationHtml(data: { name: string; referral_code: string }): string {
  const { name, referral_code } = data;
  
  // Enhanced styling for agent confirmation template
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
      <h2>Benvenuto in M1SSION, ${name}!</h2>
      <p>La tua pre-registrazione è stata confermata.</p>
      <p>Sei stato selezionato tra i primi 100 utenti e hai ricevuto <strong>100 crediti bonus</strong>.</p>
      
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Il tuo codice referral:</strong></p>
        <p style="font-size: 20px; font-weight: bold; text-align: center; color: #00a0e9;">${referral_code}</p>
      </div>
      
      <p>Condividi questo codice con i tuoi amici. Per ogni amico che si iscrive usando il tuo codice, guadagnerai <strong>50 crediti extra</strong>!</p>
      
      <p style="margin-top: 20px; font-size: 12px; color: #999;">
        Questo messaggio è stato inviato automaticamente dal form di pre-registrazione del sito web M1SSION.
      </p>
    </div>
  `;
}
