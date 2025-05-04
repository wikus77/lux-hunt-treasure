
import { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import StyledInput from "@/components/ui/styled-input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { User, Mail, Lock, Check } from "lucide-react";

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

  const handleRegister = (e: FormEvent) => {
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

    // Simulate successful registration
    setTimeout(() => {
      // Store login info
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("user", JSON.stringify({ name, email }));
      
      toast.success("Registrazione completata!", {
        description: "Il tuo account è stato creato con successo."
      });
      
      // Redirect to home page
      setTimeout(() => {
        navigate("/home");
      }, 1500);
    }, 1500);
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
