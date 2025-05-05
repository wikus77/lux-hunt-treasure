
import React, { useState } from 'react';
import { useLogin } from '@/hooks/use-login';
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface LoginFormProps {
  verificationStatus?: string | null;
  onResendVerification?: (email: string) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  verificationStatus,
  onResendVerification
}) => {
  const {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    formError
  } = useLogin();
  const [emailForResend, setEmailForResend] = useState('');

  const handleResendClick = () => {
    if (onResendVerification && emailForResend) {
      onResendVerification(emailForResend);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email */}
      <div className="space-y-2">
        <label htmlFor="email" className="block text-sm font-medium text-white">Email</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Mail className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) => {
              handleChange(e);
              setEmailForResend(e.target.value);
            }}
            placeholder="Il tuo indirizzo email"
            className="pl-10 bg-[rgba(0,0,0,0.3)] border-gray-700 text-white"
            required
          />
        </div>
        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label htmlFor="password" className="block text-sm font-medium text-white">Password</label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Lock className="h-5 w-5 text-gray-400" />
          </div>
          <Input
            type="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="La tua password"
            className="pl-10 bg-[rgba(0,0,0,0.3)] border-gray-700 text-white"
            required
          />
        </div>
        {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
      </div>

      {/* Form Error Message */}
      {formError && (
        <Alert variant="destructive" className="bg-red-900/50 border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      {/* Verification Status Message */}
      {verificationStatus === 'pending' && (
        <Alert className="bg-amber-900/50 border-amber-800">
          <div className="flex flex-col space-y-2">
            <AlertDescription className="text-amber-300">
              Verifica la tua email per completare la registrazione.
            </AlertDescription>
            <Button 
              type="button"
              variant="outline" 
              size="sm"
              onClick={handleResendClick}
              className="self-start text-amber-200 hover:text-amber-100 bg-amber-900/50 hover:bg-amber-800/50 border-amber-700"
            >
              Invia email di nuovo
            </Button>
          </div>
        </Alert>
      )}

      {verificationStatus === 'success' && (
        <Alert className="bg-green-900/50 border-green-800">
          <AlertDescription className="text-green-300">
            Email verificata con successo! Ora puoi effettuare il login.
          </AlertDescription>
        </Alert>
      )}

      {/* Bottone Login */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-cyan-400 to-blue-600 hover:shadow-glow"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Accesso in corso...
          </>
        ) : 'Accedi'}
      </Button>
    </form>
  );
};

// Also export as default for backward compatibility
export default LoginForm;
