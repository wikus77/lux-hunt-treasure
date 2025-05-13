
export type EmailType = 
  | 'welcome' 
  | 'verification' 
  | 'password_reset' 
  | 'notification'
  | 'marketing'
  | 'agent_confirmation'  // Added specific type for agent confirmations
  | 'contact';

/**
 * Interface for email sending options
 */
export interface SendEmailOptions {
  to: Array<{
    email: string;
    name?: string;
  }>;
  from?: {
    Email: string;
    Name: string;
  };
  subject: string;
  htmlContent?: string;
  textContent?: string;
  templateId?: number;
  variables?: Record<string, any>;
  trackOpens?: boolean;
  trackClicks?: boolean;
  customId?: string;
  attachments?: any[];
}

/**
 * Interface for email sending result
 */
export interface EmailResult {
  success: boolean;
  error?: any;
  data?: any;
}
