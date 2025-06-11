
import { useState } from "react";
import { ArrowLeft, LockIcon, EyeIcon, EyeOffIcon, ShieldIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

const PrivacySecurity = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    biometricLogin: true,
    locationTracking: true,
    dataSharingConsent: true,
    marketingEmails: false,
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleSwitchChange = (name: string, checked: boolean) => {
    setSecuritySettings(prev => ({
      ...prev,
      [name]: checked
    }));

    toast({
      title: "Impostazione Aggiornata",
      description: `L'impostazione ${name} è stata ${checked ? 'attivata' : 'disattivata'}.`
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSecuritySettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      toast({
        title: "Errore",
        description: "Le password non corrispondono.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Password Aggiornata",
      description: "La tua password è stata aggiornata con successo."
    });
    
    setSecuritySettings(prev => ({
      ...prev,
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }));
  };

  return (
    <div className="min-h-screen bg-black pb-6">
      <header className="px-4 py-6 flex items-center border-b border-projectx-deep-blue">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Privacy e Sicurezza</h1>
      </header>

      <div className="p-4">
        <div className="glass-card mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <ShieldIcon className="mr-2 h-5 w-5 text-projectx-neon-blue" />
            Impostazioni di Sicurezza
          </h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Autenticazione a Due Fattori</p>
                <p className="text-sm text-muted-foreground">Aumenta la sicurezza del tuo account</p>
              </div>
              <Switch 
                checked={securitySettings.twoFactorAuth}
                onCheckedChange={(checked) => handleSwitchChange("twoFactorAuth", checked)}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Login Biometrico</p>
                <p className="text-sm text-muted-foreground">Usa impronta digitale o riconoscimento facciale</p>
              </div>
              <Switch 
                checked={securitySettings.biometricLogin}
                onCheckedChange={(checked) => handleSwitchChange("biometricLogin", checked)}
              />
            </div>
          </div>
        </div>
        
        <div className="glass-card mb-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <LockIcon className="mr-2 h-5 w-5 text-projectx-neon-blue" />
            Cambia Password
          </h2>
          
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium mb-1">
                Password Attuale
              </label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showPassword ? "text" : "password"}
                  value={securitySettings.currentPassword}
                  onChange={handleInputChange}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
                Nuova Password
              </label>
              <Input
                id="newPassword"
                name="newPassword"
                type={showPassword ? "text" : "password"}
                value={securitySettings.newPassword}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                Conferma Nuova Password
              </label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={securitySettings.confirmPassword}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <Button 
              type="submit"
              className="w-full bg-gradient-to-r from-projectx-blue to-projectx-pink"
            >
              Aggiorna Password
            </Button>
          </form>
        </div>
        
        <div className="glass-card mb-6">
          <h2 className="text-lg font-semibold mb-4">Impostazioni Privacy</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Tracciamento Posizione</p>
                <p className="text-sm text-muted-foreground">Permetti all'app di accedere alla tua posizione</p>
              </div>
              <Switch 
                checked={securitySettings.locationTracking}
                onCheckedChange={(checked) => handleSwitchChange("locationTracking", checked)}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Consenso Condivisione Dati</p>
                <p className="text-sm text-muted-foreground">Condividi dati anonimi per migliorare l'app</p>
              </div>
              <Switch 
                checked={securitySettings.dataSharingConsent}
                onCheckedChange={(checked) => handleSwitchChange("dataSharingConsent", checked)}
              />
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium">Email Marketing</p>
                <p className="text-sm text-muted-foreground">Ricevi email promozionali e newsletter</p>
              </div>
              <Switch 
                checked={securitySettings.marketingEmails}
                onCheckedChange={(checked) => handleSwitchChange("marketingEmails", checked)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacySecurity;
