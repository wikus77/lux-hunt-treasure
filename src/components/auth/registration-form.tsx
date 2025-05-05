
import { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import StyledInput from "@/components/ui/styled-input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { User, Mail, Lock, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface RegistrationFormProps {
  className?: string;
}

const RegistrationForm = ({ className }: RegistrationFormProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Basic validation
    if (!name || !email || !password || !confirmPassword) {
      toast.error("Errore", {
        description: "Completa tutti i campi per continuare.",
        duration: 3000
      });
      setIsSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Errore", {
        description: "Le password non coincidono.",
        duration: 3000
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Check if email already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', email);
      
      if (checkError) {
        console.error("Error checking existing email:", checkError);
      }
      
      if (existingUsers && existingUsers.length > 0) {
        toast.error("Errore", {
          description: "Email già registrata. Prova con un'altra email o accedi.",
          duration: 3000
        });
        setIsSubmitting(false);
        return;
      }

      // Register with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin + '/auth',
          data: {
            full_name: name,
          }
        }
      });

      if (error) {
        if (error.message.includes("already registered")) {
          toast.error("Errore", {
            description: "Email già registrata. Prova con un'altra email o accedi.",
            duration: 3000
          });
        } else {
          toast.error("Errore", {
            description: error.message || "Si è verificato un errore durante la registrazione.",
            duration: 3000
          });
        }
        setIsSubmitting(false);
        return;
      }
      
      // Registration successful
      toast.success("Registrazione completata!", {
        description: "Ti abbiamo inviato una mail di verifica. Controlla la tua casella e conferma il tuo account per accedere."
      });
      
      // Redirect to verification pending page
      setTimeout(() => {
        navigate("/login?verification=pending");
      }, 2000);
      
    } catch (error: any) {
      console.error("Registration error:", error);
      toast.error("Errore", {
        description: "Si è verificato un errore. Riprova più tardi.",
        duration: 3000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      className="glass-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
    >
      <form onSubmit={handleRegister} className="space-y-6 p-6">
        {/* Name field */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white">Nome completo</Label>
          <StyledInput
            id="name"
            type="text"
            placeholder="Il tuo nome"
            value={name}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
            className="bg-black/50 border-white/10"
            icon={<User size={16} />}
          />
        </div>

        {/* Email field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white">Email</Label>
          <StyledInput
            id="email"
            type="email"
            placeholder="La tua email"
            value={email}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            className="bg-black/50 border-white/10"
            icon={<Mail size={16} />}
          />
        </div>

        {/* Password field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-white">Password</Label>
          <StyledInput
            id="password"
            type="password"
            placeholder="Crea una password"
            value={password}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            className="bg-black/50 border-white/10"
            icon={<Lock size={16} />}
          />
        </div>

        {/* Confirm Password field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-white">Conferma Password</Label>
          <StyledInput
            id="confirmPassword"
            type="password"
            placeholder="Conferma la password"
            value={confirmPassword}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
            className="bg-black/50 border-white/10"
            icon={<Check size={16} />}
          />
        </div>

        {/* Submit button */}
        <Button
          type="submit"
          className="w-full neon-button-cyan"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Registrazione in corso..." : "Registrati Ora"}
        </Button>

        {/* Login link */}
        <div className="text-center">
          <Button
            variant="link"
            className="text-cyan-400"
            onClick={() => navigate("/login")}
            type="button"
          >
            Hai già un account? Accedi
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default RegistrationForm;
