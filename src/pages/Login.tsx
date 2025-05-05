import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import AnimatedLogo from "@/components/logo/AnimatedLogo";
import StyledInput from "@/components/ui/styled-input";
import { Mail, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if there's an active session already
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Non navighiamo qui, lasciamo che Auth.tsx gestisca la navigazione
        // in base al completamento del quiz
      }
    };
    
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
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

    try {
      // Real authentication with Supabase
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      toast({
        title: "Login completato!",
        description: "Accesso effettuato con successo."
      });
      
      // Auth component will handle redirection based on quiz completion
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        variant: "destructive",
        title: "Errore di accesso",
        description: error.message || "Impossibile effettuare il login. Verifica le tue credenziali."
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          {/* Logo animato */}
          <div className="flex justify-center mb-4">
            <AnimatedLogo />
          </div>
          <p className="text-muted-foreground">
            Accedi al tuo account
          </p>
        </div>

        <form onSubmit={handleLogin} className="glass-card">
          <div className="space-y-4 p-6">
            <div>
              <Label htmlFor="email" className="text-white">Email</Label>
              <StyledInput
                id="email"
                type="email"
                placeholder="Inserisci la tua email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
                icon={<Mail size={16} />}
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-white">Password</Label>
              <StyledInput
                id="password"
                type="password"
                placeholder="Inserisci la password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
                icon={<Lock size={16} />}
              />
            </div>
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
                onClick={() => navigate("/register")}
                type="button"
              >
                Non hai un account? Registrati
              </Button>
            </div>
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
