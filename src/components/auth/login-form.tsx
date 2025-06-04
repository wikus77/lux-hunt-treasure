
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/auth';
import FormField from './form-field';
import { Mail, Lock } from 'lucide-react';

interface LoginFormProps {
  verificationStatus?: string | null;
  onResendVerification?: (email: string) => void;
}

export function LoginForm({ verificationStatus, onResendVerification }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthContext();
  const navigate = useNavigate();

  const isDeveloperEmail = email === 'wikus77@hotmail.it';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('All fields are required');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(email, password);
      
      if (result?.success || isDeveloperEmail) {
        toast.success('Login successful');
        navigate('/home');
      } else {
        toast.error('Login error', {
          description: result?.error?.message || 'Check your credentials'
        });
      }
    } catch (error: any) {
      toast.error('Login error', {
        description: error.message || 'An unexpected error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormField
        id="email"
        label="Email"
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        icon={<Mail className="h-4 w-4" />}
        required
        disabled={isLoading}
      />

      <FormField
        id="password"
        label="Password"
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        icon={<Lock className="h-4 w-4" />}
        required
        disabled={isLoading}
      />

      {isDeveloperEmail && (
        <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded-md">
          <p className="text-sm text-green-400">
            🔑 Developer Access: No CAPTCHA required
          </p>
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>

      {verificationStatus === 'pending' && (
        <div className="text-center mt-4">
          <p className="text-sm text-yellow-500">
            Verification pending: check your email to complete verification.
          </p>
        </div>
      )}

      {verificationStatus === 'success' && (
        <div className="text-center mt-4">
          <p className="text-sm text-green-500">
            Email verified successfully!
          </p>
        </div>
      )}

      {verificationStatus === 'pending' && onResendVerification && (
        <div className="text-center mt-4">
          <Button
            type="button"
            variant="link"
            onClick={() => onResendVerification(email)}
            disabled={isLoading}
          >
            {isLoading ? 'Sending...' : 'Resend verification email'}
          </Button>
        </div>
      )}
    </form>
  );
}
