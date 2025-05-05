
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import AnimatedLogo from "@/components/logo/AnimatedLogo";
import StyledInput from "@/components/ui/styled-input";
import { Mail, Lock, AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);

  useEffect(() => {
    // Check URL parameters for verification status
    const verification = searchParams.get('verification');
    if (verification === 'pending') {
      setVerificationStatus('pending');
    } else if (verification === 'success') {
      setVerificationStatus('success');
    }

    // Check if there's an active session already
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Non navighiamo qui, lasciamo che Auth.tsx gestisca la navigazione
        // in base al completamento del quiz
      }
    };
    
    checkSession();
  }, [navigate, searchParams]);

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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Check if email is verified
      if (data.user && !data.user.email_confirmed_at) {
        toast({
          variant: "destructive",
          title: "Email non verificata",
          description: "Per favore, verifica la tua email prima di accedere. Controlla la tua casella di posta."
        });
        setIsLoading(false);
        return;
      }
      
      toast({
        title: "Login completato!",
        description: "Accesso effettuato con successo."
      });
      
      // Auth component will handle redirection based on quiz completion
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Handle specific error cases
      if (error.message.includes("Email not confirmed")) {
        toast({
          variant: "destructive",
          title: "Email non verificata",
          description: "Per favore, verifica la tua email prima di accedere."
        });
      } else if (error.message.includes("Invalid login credentials")) {
        toast({
          variant: "destructive",
          title: "Credenziali non valide",
          description: "Email o password errati. Riprova."
        });
      } else {
        toast({
          variant: "destructive",
          title: "Errore di accesso",
          description: error.message || "Impossibile effettuare il login. Verifica le tue credenziali."
        });
      }
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Inserisci la tua email per ricevere nuovamente il link di verifica."
      });
      return;
    }

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      });

      if (error) throw error;

      toast({
        title: "Email inviata",
        description: "Un nuovo link di verifica è stato inviato alla tua email."
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: error.message || "Impossibile inviare l'email di verifica."
      });
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

        {verificationStatus === 'pending' && (
          <Alert className="mb-6 border-amber-500 bg-amber-500/10">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <AlertTitle className="text-amber-500">Verifica il tuo account</AlertTitle>
            <AlertDescription>
              Ti abbiamo inviato un'email di verifica. Per favore, clicca sul link contenuto nell'email per completare la registrazione.
              <Button 
                variant="link" 
                className="p-0 h-auto text-amber-400 mt-2"
                onClick={handleResendVerification}
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
