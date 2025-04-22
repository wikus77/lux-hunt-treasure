
import React, { useState } from "react";
import { Dialog } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { LogIn } from "lucide-react";

// Supporto WebAuthn (FaceID/biometrico) solo se browser supporta
const canBiometric =
  window.PublicKeyCredential &&
  typeof window.PublicKeyCredential === "function" &&
  (window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable
    ? true
    : false);

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

const LoginModal = ({ open, onClose }: LoginModalProps) => {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Finta login - qui inserire la logica reale quando la backend auth è integrata
  const handleLogin = async (biometric = false) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (!biometric && (!email || !pw)) {
        toast({
          variant: "destructive",
          title: "Dati mancanti",
          description: "Inserisci email e password"
        });
        return;
      }
      // Accesso riuscito (qui metteresti la verifica reale)
      toast({
        title: biometric
          ? "Login biometrico riuscito!"
          : "Login riuscito!",
        description:
          biometric
            ? "FaceID/biometria attivata."
            : "Accesso effettuato.",
      });
      // Chiudi la modale
      setTimeout(() => onClose(), 1000);
      // Naviga sulla home page
      setTimeout(() => window.location.assign("/home"), 1600);
    }, 1100);
  };

  const handleGoogleLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast({
        title: "Login con Google riuscito!",
        description: "Accesso effettuato tramite Google.",
      });
      // Chiudi la modale
      setTimeout(() => onClose(), 1000);
      // Naviga sulla home page
      setTimeout(() => window.location.assign("/home"), 1600);
    }, 1100);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <div className="glass-card max-w-sm mx-auto mt-16 p-6 flex flex-col items-center gap-3">
        <h2 className="font-bold text-xl mb-2 text-center neon-text">Accedi al tuo account</h2>
        
        <Button
          onClick={handleGoogleLogin}
          className="w-full mb-2 flex items-center justify-center gap-2 bg-white text-gray-800 hover:bg-gray-100"
        >
          <img src="/lovable-uploads/8c806eb0-3018-4787-a87e-ad0ce5c4ae7c.png" alt="Google" className="w-4 h-4" />
          Accedi con Google
        </Button>
        
        {canBiometric && (
          <Button
            onClick={() => handleLogin(true)}
            className="w-full mb-2 bg-gradient-to-r from-[#4361ee] to-[#7209b7] text-white rounded-full"
          >
            Accedi con FaceID / Biometria
          </Button>
        )}
        
        <div className="relative w-full my-3">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center">
            <span className="bg-black px-2 text-xs text-gray-400">OPPURE</span>
          </div>
        </div>
        
        <form
          onSubmit={e => {
            e.preventDefault();
            handleLogin(false);
          }}
          className="w-full"
        >
          <div className="mb-3">
            <Input
              type="email"
              autoComplete="username"
              placeholder="Email o username"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="mt-1 text-white"
            />
          </div>
          <div className="mb-4">
            <Input
              type="password"
              autoComplete="current-password"
              placeholder="Password"
              value={pw}
              onChange={e => setPw(e.target.value)}
              className="mt-1 text-white"
            />
          </div>
          <Button 
            className="w-full bg-gradient-to-r from-[#4361ee] to-[#7209b7] text-white rounded-full flex items-center gap-2" 
            type="submit" 
            disabled={loading}
          >
            <LogIn className="w-4 h-4" />
            Accedi
          </Button>
        </form>
        <Button variant="link" onClick={onClose} className="mt-1 text-projectx-neon-blue">Chiudi</Button>
      </div>
    </Dialog>
  );
};

export default LoginModal;
