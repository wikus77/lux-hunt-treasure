
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type EmailType = 'welcome' | 'verification' | 'password_reset' | 'notification';

interface EmailTypeSelectorProps {
  emailType: EmailType;
  onEmailTypeChange: (value: EmailType) => void;
}

const EmailTypeSelector: React.FC<EmailTypeSelectorProps> = ({ emailType, onEmailTypeChange }) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="email-type">Tipo di Email</Label>
      <Select 
        value={emailType} 
        onValueChange={(value) => onEmailTypeChange(value as EmailType)}
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
  );
};

export default EmailTypeSelector;
