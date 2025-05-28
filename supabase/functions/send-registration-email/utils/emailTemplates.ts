
// Email template configuration utility

export interface EmailTemplate {
  senderEmail: string;
  senderName: string;
  subject: string;
  htmlPart: string;
}

export const getEmailTemplate = (formType: string, name: string, referral_code?: string): EmailTemplate => {
  // Configure email based on form type
  let senderEmail = "noreply@m1ssion.com"
  let senderName = "M1SSION"
  let subject = "Benvenuto in M1SSION"
  let htmlPart = `<h2>Hai appena compiuto il primo passo.</h2><p>Benvenuto su M1SSION, la caccia ha inizio.</p>`

  // Customize email content based on form type
  if (formType === "agente") {
    senderEmail = "contact@m1ssion.com"
    subject = "Conferma ricezione richiesta agente"
    htmlPart = `<h3>Abbiamo ricevuto la tua richiesta per diventare agente. Ti contatteremo presto!</h3>`
  } else if (formType === "newsletter") {
    senderEmail = "contact@m1ssion.com"
    subject = "Iscrizione Newsletter M1SSION"
    htmlPart = `<h3>Grazie per esserti iscritto alla nostra newsletter!</h3><p>Riceverai aggiornamenti esclusivi sul lancio di M1SSION.</p>`
  } else if (formType === "contatto") {
    senderEmail = "contact@m1ssion.com"
    subject = "Abbiamo ricevuto il tuo messaggio"
    htmlPart = `<h3>Grazie per averci contattato!</h3><p>Ti risponderemo al più presto.</p>`
  } else if (formType === "preregistrazione") {
    senderEmail = "contact@m1ssion.com" 
    subject = "Pre-registrazione confermata"
    
    // Enhanced HTML for pre-registration with referral code
    // Make sure we display the actual referral code or a clear message if it's not available
    const displayReferralCode = referral_code || "CODICE NON DISPONIBILE";
    
    htmlPart = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <div style="background: linear-gradient(90deg, #00E5FF 0%, #0077FF 100%); padding: 20px; text-align: center; color: #000;">
          <h1 style="margin: 0; color: #FFF;">M1SSION</h1>
        </div>
        
        <div style="padding: 20px; background-color: #ffffff;">
          <h3>Sei ufficialmente un agente M1SSION.</h3>
          <p>Hai completato la pre-iscrizione. Tieniti pronto: la tua prima missione sta per arrivare.</p>
          
          <p style="margin-top: 20px;">Il tuo codice referral: <strong>${displayReferralCode}</strong></p>
          
          <p>Puoi invitare altri agenti usando questo codice e guadagnare crediti extra per la tua missione!</p>
        </div>
        
        <div style="font-size: 12px; text-align: center; padding-top: 20px; color: #999;">
          <p>&copy; ${new Date().getFullYear()} M1SSION. Tutti i diritti riservati.</p>
          <p>Questo messaggio è stato inviato automaticamente a seguito della tua pre-registrazione su M1SSION.</p>
        </div>
      </div>
    `
  }

  return {
    senderEmail,
    senderName,
    subject,
    htmlPart
  };
};
