
import React from 'react';
import { useLogin } from '@/hooks/use-login';

interface LoginFormProps {
  verificationStatus?: string | null;
  onResendVerification?: () => void;
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
    handleSubmit
  } = useLogin();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Email */}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
      </div>

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          id="password"
          value={formData.password}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
        />
        {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
      </div>

      {/* Verification Status Message */}
      {verificationStatus === 'pending' && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
          <p className="text-amber-800 text-sm">
            Verifica la tua email per completare la registrazione.
            <button 
              type="button"
              onClick={onResendVerification}
              className="ml-2 text-amber-600 underline hover:text-amber-800"
            >
              Invia di nuovo
            </button>
          </p>
        </div>
      )}

      {verificationStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 p-3 rounded-md">
          <p className="text-green-800 text-sm">
            Email verificata con successo! Ora puoi effettuare il login.
          </p>
        </div>
      )}

      {/* Bottone Login */}
      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Accesso in corso...' : 'Accedi'}
        </button>
      </div>
    </form>
  );
};

// Also export as default for backward compatibility
export default LoginForm;
