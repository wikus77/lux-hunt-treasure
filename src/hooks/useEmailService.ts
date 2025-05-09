
import { useState } from 'react';
import { toast } from 'sonner';
import { sendEmail, EmailType } from '@/services/mailjetService';

interface SendEmailProps {
  type: EmailType;
  email: string;
  name?: string;
  subject?: string;
  data?: Record<string, any>;
}

export function useEmailService() {
  const [isSending, setIsSending] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [lastResponse, setLastResponse] = useState<any>(null);

  /**
   * Send an email using the Mailjet service
   */
  const sendEmailService = async ({
    type,
    email,
    name = '',
    subject,
    data = {}
  }: SendEmailProps): Promise<{ success: boolean; error?: string; response?: any }> => {
    if (!email) {
      return { success: false, error: "Email address is required" };
    }

    setIsSending(true);
    setLastError(null);
    setLastResponse(null);
    
    try {
      console.log(`Attempting to send ${type} email to ${email}`);
      
      let htmlContent = '';
      let emailSubject = subject || '';
      
      // Generate content based on email type
      switch (type) {
        case 'welcome':
          emailSubject = emailSubject || "Benvenuto in M1SSION";
          htmlContent = generateWelcomeEmailHtml(name, data?.launchDate || "19 Giugno 2025");
          break;
          
        case 'notification':
          emailSubject = emailSubject || "Aggiornamento importante";
          htmlContent = generateNotificationEmailHtml(name, data?.message || "");
          break;
          
        case 'marketing':
          emailSubject = emailSubject || "Novità da M1SSION";
          htmlContent = data.htmlContent || generateDefaultMarketingEmailHtml(name);
          break;
          
        default:
          return { 
            success: false, 
            error: `Unsupported email type: ${type}`
          };
      }

      const result = await sendEmail(type, {
        to: [{ email, name }],
        subject: emailSubject,
        htmlContent: htmlContent,
        trackOpens: true,
        trackClicks: true,
        customCampaign: `${type}_email`,
        consent: {
          given: true,
          date: new Date().toISOString(), 
          method: 'web_app'
        }
      });

      setLastResponse(result);

      if (!result.success) {
        const errorMessage = result.error?.toString() || "Si è verificato un errore nell'invio dell'email";
        toast.error(`Errore nell'invio dell'email: ${errorMessage}`);
        setLastError(errorMessage);
        return { 
          success: false, 
          error: errorMessage,
          response: result 
        };
      }

      console.log("Email sent successfully:", result);
      toast.success("Email inviata con successo", {
        description: `L'email è stata inviata a ${email}`
      });
      
      return { success: true, response: result };
    } catch (error: any) {
      console.error("Exception sending email:", error);
      const errorMessage = error.message || "Si è verificato un errore nell'invio dell'email";
      setLastError(errorMessage);
      return { 
        success: false, 
        error: errorMessage,
        response: { exception: error.toString() }
      };
    } finally {
      setIsSending(false);
    }
  };

  /**
   * Send a welcome email to a new user
   */
  const sendWelcomeEmail = async (email: string, name: string = '') => {
    return sendEmailService({
      type: 'welcome',
      email,
      name
    });
  };

  /**
   * Send a notification email with a custom message
   */
  const sendNotificationEmail = async (email: string, name: string = '', subject: string, message: string) => {
    return sendEmailService({
      type: 'notification',
      email,
      name,
      subject,
      data: { message }
    });
  };

  /**
   * Send a marketing email
   */
  const sendMarketingEmail = async (email: string, name: string = '', subject: string, htmlContent: string) => {
    return sendEmailService({
      type: 'marketing',
      email,
      name,
      subject,
      data: { htmlContent }
    });
  };

  // HTML template generators
  const generateWelcomeEmailHtml = (name: string, launchDate: string): string => {
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
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo"><span class="blue-text">M1</span>SSION</div>
            </div>
            <div class="content">
              <h1>Benvenuto, ${name}!</h1>
              <p>Grazie per esserti iscritto alla newsletter di M1SSION. Sei ufficialmente parte di questa avventura esclusiva.</p>
              
              <div class="countdown">
                <h3>La sfida inizia il ${launchDate}</h3>
                <p>Riceverai aggiornamenti esclusivi 15 giorni, 7 giorni, 3 giorni e 24 ore prima del lancio.</p>
              </div>
              
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

  const generateNotificationEmailHtml = (name: string, message: string): string => {
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

  const generateDefaultMarketingEmailHtml = (name: string): string => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Novità da M1SSION</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #ffffff;
            }
            .header {
              background: linear-gradient(90deg, #00E5FF 0%, #0077FF 100%);
              padding: 20px;
              text-align: center;
              color: #000;
            }
            .content {
              padding: 30px 20px;
            }
            .cta-button {
              display: inline-block;
              background: #00E5FF;
              color: #000;
              padding: 12px 25px;
              text-decoration: none;
              border-radius: 4px;
              font-weight: bold;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              padding-top: 30px;
              font-size: 12px;
              color: #999;
              border-top: 1px solid #eee;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>M1SSION</h1>
            </div>
            <div class="content">
              <h2>Ciao ${name || 'amico di M1SSION'},</h2>
              <p>Abbiamo delle novità entusiasmanti da condividere con te!</p>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin fringilla, quam eu tempor finibus, est libero scelerisque justo, a dignissim enim elit a ante.</p>
              
              <h3>Scopri le nostre ultime novità:</h3>
              <ul>
                <li>Nuovo evento in programma</li>
                <li>Aggiornamenti sulle missioni</li>
                <li>Premi esclusivi per i membri</li>
              </ul>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="https://m1ssion.com" class="cta-button">SCOPRI DI PIÙ</a>
              </div>
            </div>
            <div class="footer">
              <p>&copy; 2025 M1SSION. Tutti i diritti riservati.</p>
              <p>Questo messaggio è stato inviato a ${name} perché hai acconsentito a ricevere comunicazioni da M1SSION.</p>
              <p>Per annullare l'iscrizione, <a href="[[UNSUB_LINK_IT]]">clicca qui</a>.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  };

  return {
    isSending,
    lastError,
    lastResponse,
    sendEmailService,
    sendWelcomeEmail,
    sendNotificationEmail,
    sendMarketingEmail
  };
}
