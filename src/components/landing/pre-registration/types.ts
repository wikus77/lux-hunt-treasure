
export interface FormData {
  name: string;
  email: string;
}

export interface PreRegistrationFormData {
  name: string;
  email: string;
}

export interface FormErrors {
  name: string;
  email: string;
}

export interface InviteOptions {
  inviteCode: string;
}

export interface PreRegistrationState {
  isSubmitted: boolean;
  isSubmitting: boolean;
  userReferralCode: string;
  showInviteOptions: boolean;
  showReferralInput: boolean;
}
