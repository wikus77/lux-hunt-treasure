
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
