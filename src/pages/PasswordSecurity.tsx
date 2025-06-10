
import { useState } from "react";
import { ArrowLeft, LockIcon, EyeIcon, EyeOffIcon, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const PasswordSecurity = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Le nuove password non corrispondono");
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error("La nuova password deve essere di almeno 6 caratteri");
      return;
    }
    
    setLoading(true);
    
    try {
      // Get current user session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Sessione non valida. Effettua il login.");
        navigate("/login");
        return;
      }
      
      // Update password using Supabase auth
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });
      
      if (error) {
        console.error("Errore nell'aggiornamento della password:", error);
        toast.error("Impossibile aggiornare la password: " + error.message);
        return;
      }
      
      toast.success("✅ Password aggiornata con successo", {
        description: "La tua password è stata cambiata correttamente."
      });
      
      // Reset form
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
    } catch (error) {
      console.error("Errore:", error);
      toast.error("Si è verificato un errore durante l'aggiornamento della password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="pt-[calc(env(safe-area-inset-top)+64px)] px-4 pb-[calc(env(safe-area-inset-bottom)+80px)]">
        <header className="flex items-center border-b border-projectx-deep-blue pb-6 mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-white">Password e Sicurezza</h1>
        </header>

        <div className="glass-card rounded-xl mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center text-white">
            <Key className="mr-2 h-5 w-5 text-projectx-neon-blue" />
            Cambia Password
          </h2>
          
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium mb-1 text-white">
                Password Attuale
              </label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={handleInputChange}
                  className="rounded-xl bg-black/50 border-white/10"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium mb-1 text-white">
                Nuova Password
              </label>
              <Input
                id="newPassword"
                name="newPassword"
                type={showPassword ? "text" : "password"}
                value={passwordData.newPassword}
                onChange={handleInputChange}
                className="rounded-xl bg-black/50 border-white/10"
                required
                minLength={6}
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1 text-white">
                Conferma Nuova Password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={passwordData.confirmPassword}
                onChange={handleInputChange}
                className="rounded-xl bg-black/50 border-white/10"
                required
                minLength={6}
              />
            </div>
            
            <Button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-projectx-blue to-projectx-pink rounded-xl"
            >
              <LockIcon className="mr-2 h-4 w-4" />
              {loading ? "Aggiornamento..." : "🔒 Aggiorna Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PasswordSecurity;
