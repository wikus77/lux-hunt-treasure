
import React, { useState, useEffect } from 'react';
import { useEmailService } from '@/hooks/email'; // Updated import
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import EmailTypeSelector from './EmailTypeSelector';
import EmailRecipientFields from './EmailRecipientFields';
import EmailTypeFields from './EmailTypeFields';
import EmailSubmitButton from './EmailSubmitButton';
import EmailDebugPanel from './EmailDebugPanel';

const EmailSender: React.FC = () => {
  const { isSending, lastError, lastResponse, sendEmail } = useEmailService();
  const [emailType, setEmailType] = useState<'welcome' | 'verification' | 'password_reset' | 'notification'>('welcome');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [verificationLink, setVerificationLink] = useState('');
  const [resetLink, setResetLink] = useState('');
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [showDetailedDebug, setShowDetailedDebug] = useState(false);

  useEffect(() => {
    // Generate default links for testing
    setVerificationLink(`https://m1ssion.app/verify?token=${generateRandomToken()}`);
    setResetLink(`https://m1ssion.app/reset-password?token=${generateRandomToken()}`);
    
    // Set default notification message if empty
    if (!message) {
      setMessage('Questo è un messaggio di prova dalla nostra app. Grazie per la tua partecipazione!');
    }
    
    // Set default subject if empty
    if (!subject) {
      setSubject('Aggiornamento importante dalla tua missione');
    }
  }, [emailType]);

  const generateRandomToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!email) {
      toast.error("Email obbligatoria", { description: "Inserisci un indirizzo email valido" });
      return;
    }

    let data = {};
    
    switch (emailType) {
      case 'verification':
        if (!verificationLink) {
          toast.error("Link di verifica mancante", { description: "Inserisci un link di verifica" });
          return;
        }
        data = { verificationLink };
        break;
      case 'password_reset':
        if (!resetLink) {
          toast.error("Link di reset mancante", { description: "Inserisci un link di reset della password" });
          return;
        }
        data = { resetLink };
        break;
      case 'notification':
        if (!subject || !message) {
          toast.error("Campi mancanti", { description: "Oggetto e messaggio sono obbligatori per le notifiche" });
          return;
        }
        data = { message };
        break;
    }

    const result = await sendEmail({
      type: emailType as any, // Type casting to fix TypeScript error
      email,
      name,
      subject,
      data
    });

    if (result.success) {
      toast.success("Email inviata con successo!", { 
        description: `L'email è stata inviata a ${email}`
      });
    } else {
      // Se c'è stato un errore, mostriamo sempre il pannello di debug
      setShowDebugInfo(true);
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Invio Email</CardTitle>
        <CardDescription>Invia email transazionali agli utenti</CardDescription>
      </CardHeader>
      <CardContent>
        <EmailDebugPanel 
          lastError={lastError}
          lastResponse={lastResponse}
          showDebugInfo={showDebugInfo}
          showDetailedDebug={showDetailedDebug}
          setShowDebugInfo={setShowDebugInfo}
          setShowDetailedDebug={setShowDetailedDebug}
        />

        <form onSubmit={handleSubmit} className="space-y-4">
          <EmailTypeSelector 
            emailType={emailType} 
            onEmailTypeChange={setEmailType} 
          />

          <EmailRecipientFields 
            email={email}
            setEmail={setEmail}
            name={name}
            setName={setName}
          />

          <EmailTypeFields 
            emailType={emailType}
            verificationLink={verificationLink}
            setVerificationLink={setVerificationLink}
            resetLink={resetLink}
            setResetLink={setResetLink}
            subject={subject}
            setSubject={setSubject}
            message={message}
            setMessage={setMessage}
          />
        </form>
      </CardContent>
      <CardFooter>
        <EmailSubmitButton 
          isSending={isSending} 
          onSubmit={handleSubmit}
        />
      </CardFooter>
    </Card>
  );
};

export default EmailSender;

