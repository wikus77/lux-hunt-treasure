// Tipo per i destinatari delle email
export interface EmailRecipient {
  email: string;
  name?: string;
}

// Opzioni generiche per l'invio email, compatibili con Mailjet e sistema Lovable
export interface SendEmailOptions {
  recipients: EmailRecipient[];

  // Campi opzionali e generici
  subject?: string;
  htmlContent?: string;
  textContent?: string;
  templateId?: number; // per email transazionali con template ID
  variables?: Record<string, any>; // dati dinamici per template (es. referral_code)
  fromEmail?: string;
  fromName?: string;

  // Compatibilità con campagne e tracking
  customCampaign?: string; // identificatore personalizzato per campagne
  trackOpens?: boolean;
  trackClicks?: boolean;

  // Supporto timestamp se necessario per logging
  timestamp?: string;

  // Catch-all per eventuali override futuri
  [key: string]: any;
}
