
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import AgeVerification from "@/components/auth/AgeVerification";

const Register = () => {
  const [step, setStep] = useState<'age-verification' | 'registration'>('age-verification');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAgeVerified = () => {
    setStep('registration');
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validazioni base
    if (!email || !password || !confirmPassword || !fullName) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Completa tutti i campi per continuare."
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Le password non corrispondono."
      });
      return;
    }

    // Simuliamo una registrazione riuscita
    toast({
      title: "Registrazione completata!",
      description: "Il tuo account è stato creato con successo."
    });

    // Redirect alla home page
    setTimeout(() => {
      navigate("/home");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 animate-glow">
            Project <span className="text-projectx-neon-blue">X</span>
          </h1>
          <p className="text-muted-foreground">
            {step === 'age-verification' 
              ? "Verifica la tua età per continuare" 
              : "Crea il tuo account per iniziare l'avventura"}
          </p>
        </div>

        {step === 'age-verification' ? (
          <AgeVerification onVerified={handleAgeVerified} />
        ) : (
          <form onSubmit={handleRegister} className="glass-card">
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Inserisci il tuo nome completo"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Inserisci la tua email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Crea una password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label htmlFor="confirmPassword">Conferma Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Conferma la tua password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            
            <Button 
              type="submit" 
              className="w-full mt-6 bg-gradient-to-r from-projectx-blue to-projectx-pink"
            >
              Registrati
            </Button>
            
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Registrandoti, accetti i nostri Termini e Condizioni e la nostra Informativa sulla Privacy.
            </div>
          </form>
        )}
        
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Hai già un account?{" "}
            <Button 
              variant="link" 
              className="text-projectx-neon-blue p-0"
              onClick={() => navigate("/home")}
            >
              Accedi
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
