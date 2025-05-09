
/**
 * Type definitions for email service
 */

/**
 * Types of emails that can be sent
 */
export type EmailType = 
  | 'welcome' 
  | 'verification' 
  | 'password_reset' 
  | 'notification'
  | 'marketing';

/**
 * Props for sending an email
 */
export interface SendEmailProps {
  type: EmailType;
  email: string;
  name?: string;
  subject?: string;
  data?: Record<string, any>;
}

/**
 * Email response result
 */
export interface EmailResult {
  success: boolean;
  error?: string;
  response?: any;
}

/**
 * Email service hook return type
 */
export interface EmailServiceHook {
  isSending: boolean;
  lastError: string | null;
  lastResponse: any;
  sendEmail: (props: SendEmailProps) => Promise<EmailResult>;
  sendWelcomeEmail: (email: string, name?: string) => Promise<EmailResult>;
  sendNotificationEmail: (email: string, subject: string, message: string, name?: string) => Promise<EmailResult>;
  sendMarketingEmail: (email: string, subject: string, htmlContent: string, name?: string) => Promise<EmailResult>;
}
