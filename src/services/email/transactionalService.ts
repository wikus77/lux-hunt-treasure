
import { EmailRecipient } from "./types";
import { sendEmail } from "./mailjetClient";
import { generateWelcomeEmail, generateNotificationEmail } from "./templates";

/**
 * Send a welcome email to a new user
 */
export const sendWelcomeEmail = async (recipient: EmailRecipient, referralCode?: string) => {
  console.log("Sending welcome email with referral code:", referralCode);
  
  return sendEmail('welcome', {
    to: [recipient],
    subject: 'Benvenuto in M1SSION!',
    templateId: 6974914, // Use the Mailjet template ID
    variables: {
      name: recipient.name,
      referral_code: referralCode || "MISSIONE"
    },
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
    htmlContent: generateNotificationEmail(subject, message),
    trackOpens: true,
    customCampaign: 'notification'
  });
};
