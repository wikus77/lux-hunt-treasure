
import { useState } from 'react';
import { FormData } from './types';
import { toast } from 'sonner';

export const usePreRegistration = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState('');

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/supabase/functions/v1/handle-pre-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email
        }),
      });

      const data = await response.json();

      if (data.success) {
        setReferralCode(data.referralCode);
        setIsSuccess(true);
        toast.success('Pre-registrazione completata!');
      } else {
        throw new Error(data.error || 'Errore durante la pre-registrazione');
      }
    } catch (err: any) {
      setError(err.message);
      toast.error('Errore durante la pre-registrazione');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '' });
    setIsSuccess(false);
    setError(null);
    setReferralCode('');
  };

  return {
    formData,
    isSubmitting,
    isSuccess,
    error,
    referralCode,
    handleInputChange,
    handleSubmit,
    resetForm
  };
};
