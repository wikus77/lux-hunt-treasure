
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import TurnstileWidget from './TurnstileWidget';
import { useTurnstile } from '@/hooks/useTurnstile';

interface TurnstileProtectedFormProps {
  onSubmit: (data: any) => Promise<void>;
  formTitle?: string;
}

const TurnstileProtectedForm: React.FC<TurnstileProtectedFormProps> = ({
  onSubmit,
  formTitle = 'Protected Form'
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { isVerifying, error: verificationError, verifyToken } = useTurnstile({
    action: 'form_submission',
    onError: (error) => {
      toast.error('Verification Failed', {
        description: error
      });
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!turnstileToken) {
      toast.error('Please complete the security check');
      return;
    }

    setIsSubmitting(true);
    try {
      // First verify the token
      const isValid = await verifyToken(turnstileToken);
      
      if (!isValid) {
        throw new Error('Security verification failed');
      }
      
      // If verification passes, submit the form
      await onSubmit(formData);
      
      // Reset form after successful submission
      setFormData({ name: '', email: '' });
      setTurnstileToken(null);
      
      toast.success('Form submitted successfully');
    } catch (error: any) {
      toast.error('Submission Error', {
        description: error.message || 'An error occurred during submission'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">{formTitle}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Name
          </label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>
        
        <div className="mt-4">
          <TurnstileWidget 
            onVerify={setTurnstileToken}
            action="form_submission"
          />
          {verificationError && (
            <p className="text-sm text-red-500 mt-1">{verificationError}</p>
          )}
        </div>
        
        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting || isVerifying || !turnstileToken}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </div>
  );
};

export default TurnstileProtectedForm;
