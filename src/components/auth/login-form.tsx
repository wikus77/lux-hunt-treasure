
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Mail, Lock, AlertTriangle, CheckCircle } from "lucide-react";
import FormField from "./form-field";
import { useLogin } from "@/hooks/use-login";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface LoginFormProps {
  className?: string;
  verificationStatus: string | null;
  onResendVerification: () => void;
}

const LoginForm = ({ className, verificationStatus, onResendVerification }: LoginFormProps) => {
  const {
    formData,
    errors,
    isLoading,
    handleChange,
    handleSubmit
  } = useLogin();

  return (
    <motion.div 
      className="w-full max-w-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      {verificationStatus === 'pending' && (
        <Alert className="mb-6 border-amber-500 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-500" />
          <AlertTitle className="text-amber-500">Verifica il tuo account</AlertTitle>
          <AlertDescription>
            Ti abbiamo inviato un'email di verifica. Per favore, clicca sul link contenuto nell'email per completare la registrazione.
            <Button 
              variant="link" 
              className="p-0 h-auto text-amber-400 mt-2"
              onClick={onResendVerification}
            >
              Invia nuovamente l'email di verifica
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {verificationStatus === 'success' && (
        <Alert className="mb-6 border-green-500 bg-green-500/10">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-green-500">Email verificata con successo</AlertTitle>
          <AlertDescription>
            La tua email è stata verificata. Ora puoi accedere al tuo account.
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="glass-card">
        <div className="space-y-4 p-6">
          {/* Email field */}
          <FormField
            id="email"
            type="email"
            label="Email"
            placeholder="Inserisci la tua email"
            value={formData.email}
            onChange={handleChange}
            icon={<Mail size={16} />}
            error={errors.email}
          />

          {/* Password field */}
          <FormField
            id="password"
            type="password"
            label="Password"
            placeholder="Inserisci la password"
            value={formData.password}
            onChange={handleChange}
            icon={<Lock size={16} />}
            error={errors.password}
          />
        </div>

        <div className="p-6 pt-2">
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-projectx-blue to-projectx-pink font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Accesso in corso..." : "Accedi"}
          </Button>

          <div className="mt-4 text-center">
            <Button
              variant="link"
              className="text-projectx-neon-blue p-0 hover:underline"
              onClick={() => window.location.href = "/register"}
              type="button"
            >
              Non hai un account? Registrati
            </Button>
          </div>
        </div>
      </form>
    </motion.div>
  );
};

export default LoginForm;
