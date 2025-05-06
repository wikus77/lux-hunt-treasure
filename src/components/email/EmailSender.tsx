
import React, { useState, useEffect } from 'react';
import { useEmailService } from '@/hooks/useEmailService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EmailSender: React.FC = () => {
  const { isSending, lastError, sendEmail } = useEmailService();
  const [emailType, setEmailType] = useState<'welcome' | 'verification' | 'password_reset' | 'notification'>('welcome');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [verificationLink, setVerificationLink] = useState('');
  const [resetLink, setResetLink] = useState('');
  const [showDebugInfo, setShowDebugInfo] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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
      type: emailType,
      email,
      name,
      subject,
      data
    });

    if (result.success) {
      toast.success("Email inviata con successo!", { 
        description: `L'email è stata inviata a ${email}`
      });
    }
  };

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader>
        <CardTitle>Invio Email</CardTitle>
        <CardDescription>Invia email transazionali agli utenti</CardDescription>
      </CardHeader>
      <CardContent>
        {lastError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Errore: {lastError}
              <Button 
                variant="link" 
                size="sm" 
                className="ml-2 p-0 h-auto" 
                onClick={() => setShowDebugInfo(!showDebugInfo)}
              >
                {showDebugInfo ? 'Nascondi dettagli' : 'Mostra dettagli'}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {showDebugInfo && (
          <div className="bg-gray-900 text-white p-3 rounded mb-4 text-xs overflow-auto max-h-32">
            <p>Assicurati che:</p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>La chiave API Resend sia configurata correttamente nelle variabili d'ambiente di Supabase</li>
              <li>Il dominio di invio sia verificato su Resend</li>
              <li>L'email destinataria non sia bloccata o inesistente</li>
              <li>Le quote del servizio email non siano esaurite</li>
            </ol>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email-type">Tipo di Email</Label>
            <Select 
              value={emailType} 
              onValueChange={(value) => setEmailType(value as any)}
            >
              <SelectTrigger id="email-type">
                <SelectValue placeholder="Seleziona tipo di email" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="welcome">Benvenuto</SelectItem>
                <SelectItem value="verification">Verifica Email</SelectItem>
                <SelectItem value="password_reset">Reset Password</SelectItem>
                <SelectItem value="notification">Notifica</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Destinatario</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Nome Destinatario (opzionale)</Label>
            <Input
              id="name"
              placeholder="Mario Rossi"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {emailType === 'verification' && (
            <div className="space-y-2">
              <Label htmlFor="verification-link">Link di Verifica</Label>
              <Input
                id="verification-link"
                placeholder="https://m1ssion.app/verify?token=xyz"
                value={verificationLink}
                onChange={(e) => setVerificationLink(e.target.value)}
                required
              />
            </div>
          )}

          {emailType === 'password_reset' && (
            <div className="space-y-2">
              <Label htmlFor="reset-link">Link Reset Password</Label>
              <Input
                id="reset-link"
                placeholder="https://m1ssion.app/reset-password?token=xyz"
                value={resetLink}
                onChange={(e) => setResetLink(e.target.value)}
                required
              />
            </div>
          )}

          {emailType === 'notification' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="subject">Oggetto</Label>
                <Input
                  id="subject"
                  placeholder="Aggiornamento sulla tua missione"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Messaggio</Label>
                <Textarea
                  id="message"
                  placeholder="Contenuto del messaggio..."
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>
            </>
          )}
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full"
          onClick={handleSubmit}
          disabled={isSending}
        >
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Invio in corso...
            </>
          ) : (
            "Invia Email"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default EmailSender;
