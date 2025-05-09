
export interface ContactData {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  type?: string;
  to?: Array<{email: string, name?: string}>;
  htmlContent?: string;
  textContent?: string;
  templateId?: number;
  variables?: Record<string, any>;
  trackOpens?: boolean;
  trackClicks?: boolean;
  customCampaign?: string;
  customId?: string;
  consent?: {
    given: boolean;
    date: string;
    method: string;
  };
  from?: {
    email: string;
    name: string;
  };
}
