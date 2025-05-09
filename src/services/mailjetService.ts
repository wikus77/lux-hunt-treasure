
import { supabase } from "@/integrations/supabase/client";

type EmailRecipient = {
  email: string;
  name?: string;
};

interface SendEmailOptions {
  to: EmailRecipient[];
  subject: string;
  htmlContent: string;
  textContent?: string;
  templateId?: number;
  variables?: Record<string, any>;
  trackOpens?: boolean;
  trackClicks?: boolean;
  customCampaign?: string;
  customId?: string;
  from?: {
    Email: string;
    Name: string;
  };
  consent?: {
    given: boolean;
    date: string;
    method: string;
  };
}

// Types of emails
export type EmailType = 'transactional' | 'marketing' | 'welcome' | 'notification' | 'contact';

/**
 * Send an email using Mailjet
 */
export const sendEmail = async (type: EmailType, options: SendEmailOptions) => {
  try {
    console.log(`Sending ${type} email via Mailjet Edge Function`);
    
    // Add detailed logging to help with debugging
    console.log("Email options:", JSON.stringify({
      type,
      to: options.to,
      subject: options.subject,
      from: options.from || {
        Email: "contact@m1ssion.com",
        Name: "M1SSION",
      },
      trackOpens: options.trackOpens,
      trackClicks: options.trackClicks
    }, null, 2));
    
    const { data, error } = await supabase.functions.invoke('send-mailjet-email', {
      body: {
        type,
        ...options,
        from: options.from || {
          Email: "contact@m1ssion.com",
          Name: "M1SSION",
        }
      }
    });

    if (error) {
      console.error('Error sending email:', error);
      return { success: false, error };
    }

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (err) {
    console.error('Exception when sending email:', err);
    return { success: false, error: err };
  }
};

/**
 * Send a welcome email to a new user
 */
export const sendWelcomeEmail = async (recipient: EmailRecipient) => {
  return sendEmail('welcome', {
    to: [recipient],
    subject: 'Benvenuto in M1SSION!',
    htmlContent: `
      <h1>Benvenuto in M1SSION, ${recipient.name || 'nuovo utente'}!</h1>
      <p>Grazie per esserti iscritto alla nostra piattaforma. Siamo felici di averti con noi!</p>
      <p>Puoi iniziare ad esplorare la nostra applicazione e scoprire tutte le funzionalità disponibili.</p>
      <p>Se hai domande o hai bisogno di assistenza, non esitare a contattarci.</p>
      <p>Cordiali saluti,<br>Il team di M1SSION</p>
    `,
    trackOpens: true,
    trackClicks: true,
    customCampaign: 'welcome_email',
    consent: {
      given: true,
      date: new Date().toISOString(),
      method: 'signup'
    }
  });
};

/**
 * Send a marketing email to subscribers
 */
export const sendMarketingEmail = async (
  recipients: EmailRecipient[],
  subject: string,
  htmlContent: string,
  campaignName: string
) => {
  return sendEmail('marketing', {
    to: recipients,
    subject,
    htmlContent,
    trackOpens: true,
    trackClicks: true,
    customCampaign: campaignName,
  });
};

/**
 * Send a notification email
 */
export const sendNotificationEmail = async (
  recipient: EmailRecipient,
  subject: string,
  message: string
) => {
  return sendEmail('notification', {
    to: [recipient],
    subject,
    htmlContent: `
      <h2>${subject}</h2>
      <p>${message}</p>
      <p>Cordiali saluti,<br>Il team di M1SSION</p>
    `,
    trackOpens: true,
    customCampaign: 'notification'
  });
};

/**
 * Subscribe email to marketing list
 * In a production app, you would use Mailjet's Contacts API
 * Here we just simulate the subscription
 */
export const subscribeToMarketingList = async (email: string, name: string) => {
  try {
    // First save to your DB
    const { error: dbError } = await supabase
      .from('newsletter_subscribers')
      .insert({
        email,
        name,
        campaign: 'website_signup'
      });
    
    if (dbError) throw dbError;
    
    // Then you could call the Mailjet Contacts API
    // This would be implemented in a separate Edge Function
    
    return { success: true };
  } catch (error) {
    console.error('Error subscribing to marketing list:', error);
    return { success: false, error };
  }
};

/**
 * Helper to build HTML newsletters
 */
export const buildNewsletterTemplate = (title: string, content: string): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff; }
        .header { background: linear-gradient(90deg, #00E5FF 0%, #0077FF 100%); padding: 20px; text-align: center; color: #000; }
        .content { padding: 20px; }
        .button { display: inline-block; background: #00E5FF; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        .footer { font-size: 12px; text-align: center; padding-top: 20px; color: #999; }
        .unsubscribe { font-size: 11px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>M1SSION</h1>
        </div>
        <div class="content">
          <h2>${title}</h2>
          ${content}
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} M1SSION. Tutti i diritti riservati.</p>
          <div class="unsubscribe">
            <p>Se non vuoi più ricevere queste email, <a href="[[UNSUB_LINK_EN]]">clicca qui per annullare l'iscrizione</a>.</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
};
