
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Mail, Lock, Check } from "lucide-react";

const RegisterForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
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
    <form onSubmit={handleRegister} className="space-y-6 p-6">
      {/* Name field */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-white">Nome completo</Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
            <User size={16} />
          </div>
          <Input
            id="name"
            type="text"
            placeholder="Il tuo nome"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-black/50 border-white/10 pl-10"
          />
        </div>
      </div>

      {/* Email field */}
      <div className="space-y-2">
        <Label htmlFor="email" className="text-white">Email</Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
            <Mail size={16} />
          </div>
          <Input
            id="email"
            type="email"
            placeholder="La tua email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-black/50 border-white/10 pl-10"
          />
        </div>
      </div>

      {/* Password field */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-white">Password</Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
            <Lock size={16} />
          </div>
          <Input
            id="password"
            type="password"
            placeholder="Crea una password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-black/50 border-white/10 pl-10"
          />
        </div>
      </div>

      {/* Confirm Password field */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-white">Conferma Password</Label>
        <div className="relative">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
            <Check size={16} />
          </div>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="Conferma la password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="bg-black/50 border-white/10 pl-10"
          />
        </div>
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
  );
};

export default RegisterForm;
