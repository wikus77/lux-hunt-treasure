import { generateWelcomeEmailHtml, generateNotificationEmailHtml } from "@/hooks/email/templates";

/**
 * Generate HTML content for welcome email
 */
export const generateWelcomeEmail = (name: string, referralCode?: string): string => {
  const template = generateWelcomeEmailHtml(name);
  
  // If we have a referral code, replace the placeholder with the actual code
  if (referralCode) {
    return template.replace('{{#if referral_code}}', '')
                  .replace('{{referral_code}}', referralCode)
                  .replace('{{/if}}', '');
  }
  
  // Otherwise remove the referral code section entirely
  const parts = template.split('{{#if referral_code}}');
  if (parts.length > 1) {
    const endParts = parts[1].split('{{/if}}');
    if (endParts.length > 1) {
      return parts[0] + endParts[1];
    }
  }
  
  return template;
};

/**
 * Generate HTML content for notification email
 */
export const generateNotificationEmail = (subject: string, message: string): string => {
  return generateNotificationEmailHtml(subject, message);
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

/**
 * Generate welcome email HTML
 */
export const generateWelcomeEmailHtml = (name: string = ''): string => {
  return `
    <h1>Benvenuto in M1SSION, ${name || 'nuovo utente'}!</h1>
    <p>Grazie per esserti iscritto alla nostra piattaforma. Siamo felici di averti con noi!</p>
    <p>Puoi iniziare ad esplorare la nostra applicazione e scoprire tutte le funzionalità disponibili.</p>
    <p>Se hai domande o hai bisogno di assistenza, non esitare a contattarci.</p>
    <p>Cordiali saluti,<br>Il team di M1SSION</p>
  `;
};

/**
 * Generate notification email HTML
 */
export const generateNotificationEmailHtml = (subject: string, message: string): string => {
  return `
    <h2>${subject}</h2>
    <p>${message}</p>
    <p>Cordiali saluti,<br>Il team di M1SSION</p>
  `;
};
