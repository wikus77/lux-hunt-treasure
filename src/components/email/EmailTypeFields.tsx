
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type EmailType = 'welcome' | 'verification' | 'password_reset' | 'notification';

interface EmailTypeFieldsProps {
  emailType: EmailType;
  verificationLink: string;
  setVerificationLink: (link: string) => void;
  resetLink: string;
  setResetLink: (link: string) => void;
  subject: string;
  setSubject: (subject: string) => void;
  message: string;
  setMessage: (message: string) => void;
}

const EmailTypeFields: React.FC<EmailTypeFieldsProps> = ({
  emailType,
  verificationLink,
  setVerificationLink,
  resetLink,
  setResetLink,
  subject,
  setSubject,
  message,
  setMessage
}) => {
  if (emailType === 'welcome') {
    return null; // No additional fields for welcome emails
  }
  
  if (emailType === 'verification') {
    return (
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
    );
  }
  
  if (emailType === 'password_reset') {
    return (
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
    );
  }
  
  if (emailType === 'notification') {
    return (
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
    );
  }
  
  return null;
};

export default EmailTypeFields;
