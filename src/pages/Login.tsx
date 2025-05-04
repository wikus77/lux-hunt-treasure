
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { LoginModal } from "@/components/auth/LoginModal";
import { MagneticButton } from "@/components/ui/magnetic-button";
import AnimatedLogo from "@/components/logo/AnimatedLogo";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Validazioni base
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Completa tutti i campi per continuare."
      });
      setIsLoading(false);
      return;
    }

    // Simuliamo un login riuscito
    setTimeout(() => {
      toast({
        title: "Login completato!",
        description: "Accesso effettuato con successo."
      });
  
      // Redirect alla home page
      setTimeout(() => {
        setIsLoading(false);
        navigate("/home");
      }, 500);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {/* Sostituito il testo con il logo AnimatedLogo */}
          <div className="flex justify-center mb-4">
            <AnimatedLogo />
          </div>
          <p className="text-muted-foreground">
            Accedi al tuo account
          </p>
        </div>

        <form onSubmit={handleLogin} className="glass-card">
          <div className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Inserisci la tua email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 text-white bg-black/50 border-white/20 placeholder-white/50"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Inserisci la password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 text-white bg-black/50 border-white/20 placeholder-white/50"
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full mt-6 bg-gradient-to-r from-projectx-blue to-projectx-pink font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Accesso in corso..." : "Accedi"}
          </Button>

          <div className="mt-4 text-center">
            <Button
              variant="link"
              className="text-projectx-neon-blue p-0 hover:underline"
              onClick={() => navigate("/register")}
              type="button"
            >
              Non hai un account? Registrati
            </Button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-white/70">
            Accedendo accetti i nostri Termini e Condizioni e la nostra Informativa sulla Privacy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
