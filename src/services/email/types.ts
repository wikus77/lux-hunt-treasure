
import { supabase } from "@/integrations/supabase/client";

export type EmailRecipient = {
  email: string;
  name?: string;
};

export interface SendEmailOptions {
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

export interface EmailResult {
  success: boolean;
  data?: any;
  error?: any;
}
