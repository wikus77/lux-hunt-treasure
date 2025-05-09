// Existing imports and types
import { corsHeaders } from "./cors.ts";

// Contact data interface
export interface ContactData {
  type: string;
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  to?: EmailRecipient[];
  from?: EmailSender;
  trackOpens?: boolean;
  trackClicks?: boolean;
  htmlContent?: string;
  textContent?: string;
  customCampaign?: string;
  customId?: string;
  consent?: ConsentData;
  referral_code?: string; // Support for referral codes in emails
}

export interface EmailRecipient {
  name?: string;
  email?: string;
  Name?: string;
  Email?: string;
}

export interface EmailSender {
  Email: string;
  Name: string;
}

export interface ConsentData {
  given: boolean;
  date: string;
  method: string;
}

// Response types
export interface ErrorResponse {
  success: false;
  message: string;
  errorDetails?: any;
  status?: number;
}

export interface SuccessResponse {
  success: true;
  data: any;
}

export type ApiResponse = ErrorResponse | SuccessResponse;
