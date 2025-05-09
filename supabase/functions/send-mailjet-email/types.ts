// Existing imports and types
import { corsHeaders } from "./cors.ts";

// Contact data interface
export interface ContactData {
  type: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message?: string;
  to: EmailRecipient[];
  from?: EmailSender;
  trackOpens?: boolean;
  trackClicks?: boolean;
  customCampaign?: string;
  consent?: ConsentData;
  referral_code?: string; // New: Support for referral codes
}

export interface EmailRecipient {
  name?: string;
  email: string;
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
  details?: any;
  status?: number;
}

export interface SuccessResponse {
  success: true;
  data: any;
}

export type ApiResponse = ErrorResponse | SuccessResponse;
