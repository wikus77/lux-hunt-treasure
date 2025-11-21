
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface EmailRecipientFieldsProps {
  email: string;
  setEmail: (email: string) => void;
  name: string;
  setName: (name: string) => void;
}

const EmailRecipientFields: React.FC<EmailRecipientFieldsProps> = ({ 
  email, 
  setEmail, 
  name, 
  setName 
}) => {
  return (
    <>
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
    </>
  );
};

export default EmailRecipientFields;
