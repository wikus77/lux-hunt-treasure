
/**
 * Interface for contact form data and email sending
 */
export interface ContactData {
  type?: 'contact' | 'marketing' | 'notification' | 'welcome';
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  to?: Array<{
    email: string;
    name?: string;
  }>;
  htmlContent?: string;
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
