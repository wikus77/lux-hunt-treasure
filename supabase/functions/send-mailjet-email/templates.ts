
import { ContactData } from "./types.ts";

// Function to generate HTML content for contact emails
export function generateContactEmailHtml(data: ContactData): string {
  const { name, email, phone, subject, message } = data;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #00e5ff; color: #000; padding: 10px 20px; border-radius: 5px; }
        .content { padding: 20px 0; }
        .footer { font-size: 12px; color: #999; border-top: 1px solid #eee; margin-top: 30px; padding-top: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>Nuovo messaggio da M1SSION</h2>
        </div>
        <div class="content">
          <p><strong>Nome:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Telefono:</strong> ${phone || 'Non fornito'}</p>
          <p><strong>Oggetto:</strong> ${subject || 'Contatto dal sito M1SSION'}</p>
          <p><strong>Messaggio:</strong></p>
          <p style="white-space: pre-line; background: #f9f9f9; padding: 15px; border-radius: 5px;">${message}</p>
        </div>
        <div class="footer">
          <p>Questo messaggio è stato inviato automaticamente dal form di contatto di M1SSION.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
