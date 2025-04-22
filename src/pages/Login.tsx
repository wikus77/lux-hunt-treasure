
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import LoginModal from "@/components/auth/LoginModal";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validazioni base
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Completa tutti i campi per continuare."
      });
      return;
    }

    // Simuliamo un login riuscito
    toast({
      title: "Login completato!",
      description: "Accesso effettuato con successo."
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
            M1SSION
          </h1>
          <p className="text-muted-foreground">
            Accedi al tuo account
          </p>
        </div>

        <form onSubmit={handleLogin} className="glass-card">
          <div className="space-y-4">
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
                placeholder="Inserisci la password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full mt-6 bg-gradient-to-r from-projectx-blue to-projectx-pink"
          >
            Accedi
          </Button>
          
          <div className="mt-4 text-center">
            <Button 
              variant="link" 
              className="text-projectx-neon-blue p-0 hover:underline"
              onClick={() => navigate("/register")}
            >
              Non hai un account? Registrati
            </Button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Accedendo accetti i nostri Termini e Condizioni e la nostra Informativa sulla Privacy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
