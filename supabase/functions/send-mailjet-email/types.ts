
// Define the possible types of emails that can be sent
export type EmailType = 'contact' | 'welcome' | 'notification' | 'marketing' | 'pre_registration' | 'verification' | 'password_reset' | 'transactional';

// Define the structure for contact form data
export interface ContactData {
  type: EmailType;
  name?: string;
  email?: string;
  message?: string;
  subject?: string;
  phone?: string;
  
  // For direct email sending
  to?: Array<{email: string, name?: string} | {Email: string, Name?: string}>;
  htmlContent?: string;
  templateId?: number;
  variables?: Record<string, any>;
  from?: {
    Email: string;
    Name: string;
  };
  trackOpens?: boolean;
  trackClicks?: boolean;
  customCampaign?: string;
  customId?: string;
  consent?: {
    given: boolean;
    date: string;
    method: string;
  };
  referral_code?: string;
  timestamp?: string;
}
