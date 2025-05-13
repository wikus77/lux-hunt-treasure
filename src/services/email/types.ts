
// Tipo per i destinatari delle email
export interface EmailRecipient {
  email: string;
  name?: string;
}

// Opzioni generiche per l'invio email, compatibili con Mailjet e sistema Lovable
export interface SendEmailOptions {
  to: EmailRecipient[];
  
  // Campi opzionali e generici
  subject?: string;
  htmlContent?: string;
  textContent?: string;
  templateId?: number; // per email transazionali con template ID
  variables?: Record<string, any>; // dati dinamici per template (es. referral_code)
  
  // Campi per il mittente
  from?: {
    Email: string;
    Name: string;
  };
  
  // Opzioni di tracking
  trackOpens?: boolean;
  trackClicks?: boolean;
  
  // Identificatori campagna
  customCampaign?: string; // identificatore personalizzato per campagne
  
  // Gestione privacy e consenso
  consent?: {
    given: boolean;
    date: string;
    method: string;
  };
  
  // Campi aggiuntivi
  [key: string]: any;
}

export interface EmailResult {
  success: boolean;
  data?: any;
  error?: any;
}

export type EmailType = 'welcome' | 'notification' | 'agent_confirmation' | 'marketing';
