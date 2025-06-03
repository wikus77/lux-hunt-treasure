
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface LoginFormProps {
  verificationStatus?: string | null;
  onResendVerification?: (email: string) => void;
}

export function LoginForm({ verificationStatus, onResendVerification }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        toast.error("Errore di accesso", {
          description: error.message === "Invalid login credentials" 
            ? "Credenziali non valide. Verifica email e password." 
            : error.message
        });
        return;
      }

      if (data.user) {
        console.log('✅ Login successful, redirecting to /home');
        toast.success("Accesso effettuato", {
          description: "Benvenuto!"
        });
        
        // Force redirect to /home after successful login
        navigate('/home', { replace: true });
      }
    } catch (error: any) {
      console.error('Login exception:', error);
      toast.error("Errore", {
        description: "Si è verificato un errore durante l'accesso."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {verificationStatus === 'pending' && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-900/30 border border-yellow-600 rounded-lg p-4 mb-4"
        >
          <p className="text-yellow-200 text-sm">
            Verifica la tua email prima di accedere. Controlla la casella di posta.
          </p>
          {onResendVerification && (
            <Button
              type="button"
              variant="link"
              className="text-yellow-400 p-0 h-auto mt-2"
              onClick={() => onResendVerification(email)}
            >
              Invia di nuovo
            </Button>
          )}
        </motion.div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-white">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="email"
            type="email"
            placeholder="La tua email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pl-10 bg-black/50 border-white/10 text-white"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-white">Password</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="La tua password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="pl-10 pr-10 bg-black/50 border-white/10 text-white"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
        disabled={isLoading}
      >
        {isLoading ? "Accesso in corso..." : "Accedi"}
      </Button>
    </form>
  );
}
