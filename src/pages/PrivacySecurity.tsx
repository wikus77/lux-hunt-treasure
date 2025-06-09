import { useState } from "react";
import { ArrowLeft, LockIcon, EyeIcon, EyeOffIcon, ShieldIcon, FileTextIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const PrivacySecurity = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isGdprExpanded, setIsGdprExpanded] = useState(false);
  const [deleteAccountForm, setDeleteAccountForm] = useState({
    email: "",
    reason: ""
  });
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

  const handleDownloadPrivacyPolicy = () => {
    toast({
      title: "Download Privacy Policy",
      description: "Il download della Privacy Policy verrà avviato a breve."
    });
    // Placeholder per il download del PDF
  };

  const handleDeleteAccountRequest = () => {
    if (!deleteAccountForm.email || !deleteAccountForm.reason) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi richiesti.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Richiesta Inviata",
      description: "La tua richiesta di cancellazione account è stata inviata al nostro team."
    });
    
    setDeleteAccountForm({ email: "", reason: "" });
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
        {/* Informativa GDPR & Sicurezza */}
        <div className="glass-card mb-6">
          <button
            onClick={() => setIsGdprExpanded(!isGdprExpanded)}
            className="w-full flex items-center justify-between p-4 text-left"
          >
            <div className="flex items-center">
              <ShieldIcon className="mr-2 h-5 w-5 text-projectx-neon-blue" />
              <span className="text-lg font-semibold">Informativa GDPR & Sicurezza</span>
            </div>
            {isGdprExpanded ? (
              <ChevronUpIcon className="h-5 w-5" />
            ) : (
              <ChevronDownIcon className="h-5 w-5" />
            )}
          </button>
          
          {isGdprExpanded && (
            <div className="px-4 pb-4 max-h-[70vh] overflow-y-auto">
              <div className="prose prose-invert max-w-none text-sm space-y-4">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-projectx-neon-blue mb-2">🛡️ Privacy e Sicurezza — M1SSION™</h2>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Titolare del trattamento</h3>
                  <p className="text-gray-300">
                    M1SSION™ KFT<br/>
                    Sede legale: 1077 Budapest, Izabella utca 2 alagsor 1<br/>
                    Email contatto: contact@m1ssion.com
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Finalità del trattamento</h3>
                  <ul className="text-gray-300 space-y-1">
                    <li>• Gestione dell'account e autenticazione</li>
                    <li>• Gestione delle missioni e della classifica</li>
                    <li>• Tracciamento dell'attività utente all'interno dell'app</li>
                    <li>• Notifiche, aggiornamenti e comunicazioni (solo se acconsentito)</li>
                    <li>• Gestione di pagamenti, piani, e premi</li>
                    <li>• Analisi e miglioramento dei servizi</li>
                    <li>• Adempimenti legali e antifrode</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Dati trattati</h3>
                  <ul className="text-gray-300 space-y-1">
                    <li>• Dati identificativi: nome, email, indirizzo IP</li>
                    <li>• Dati di geolocalizzazione (solo con consenso e per gioco attivo)</li>
                    <li>• Dati tecnici (dispositivo, browser, sistema operativo)</li>
                    <li>• Dati di pagamento (mai conservati su M1SSION™, ma su Stripe)</li>
                    <li>• Attività di gioco (BUZZ, indizi sbloccati, premi, XP)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Base giuridica del trattamento</h3>
                  <ul className="text-gray-300 space-y-1">
                    <li>• Esecuzione del contratto (Art. 6.1.b GDPR)</li>
                    <li>• Consenso esplicito (Art. 6.1.a)</li>
                    <li>• Obblighi di legge (Art. 6.1.c)</li>
                    <li>• Interesse legittimo del titolare (Art. 6.1.f)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Conservazione dei dati</h3>
                  <ul className="text-gray-300 space-y-1">
                    <li>• I dati sono conservati per il tempo strettamente necessario all'erogazione del servizio</li>
                    <li>• I log di gioco sono conservati per massimo 24 mesi</li>
                    <li>• I dati di pagamento sono gestiti da Stripe e non vengono mai salvati su Supabase o sistemi interni</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Diritti dell'utente (Art. 12–22 GDPR)</h3>
                  <p className="text-gray-300 mb-2">Ogni utente ha il diritto di:</p>
                  <ul className="text-gray-300 space-y-1">
                    <li>• Accedere ai propri dati</li>
                    <li>• Correggerli o aggiornarli</li>
                    <li>• Revocare il consenso in qualsiasi momento</li>
                    <li>• Chiedere la cancellazione del proprio account e dei dati</li>
                    <li>• Ottenere una copia in formato strutturato (portabilità)</li>
                    <li>• Opporsi al trattamento o limitarlo</li>
                    <li>• Proporre reclamo all'autorità competente (Garante Privacy)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Cookie e tracciamenti</h3>
                  <ul className="text-gray-300 space-y-1">
                    <li>• L'app utilizza solo cookie tecnici essenziali</li>
                    <li>• Su m1ssion.com (versione web) è attivo Cookiebot per il consenso personalizzato</li>
                    <li>• Google Analytics 4 viene attivato solo se l'utente acconsente esplicitamente</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Sicurezza tecnica</h3>
                  <ul className="text-gray-300 space-y-1">
                    <li>• I dati sono cifrati in transito (TLS/SSL) e a riposo (AES-256)</li>
                    <li>• Accesso protetto tramite autenticazione JWT su Supabase</li>
                    <li>• Monitoraggio antifrode e logging centralizzato</li>
                    <li>• Accesso ai dati limitato ai ruoli autorizzati tramite RLS attive su tutte le tabelle</li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-gray-600">
                  <Button 
                    onClick={handleDownloadPrivacyPolicy}
                    className="flex items-center justify-center bg-gradient-to-r from-projectx-blue to-projectx-pink"
                  >
                    <FileTextIcon className="h-4 w-4 mr-2" />
                    📄 Scarica Privacy Policy (PDF)
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="destructive" className="flex items-center justify-center">
                        <TrashIcon className="h-4 w-4 mr-2" />
                        🗑️ Richiedi cancellazione account
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-black/95 backdrop-blur-md border border-white/10">
                      <DialogHeader>
                        <DialogTitle className="text-white">Richiesta Cancellazione Account</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-white mb-1">
                            Email
                          </label>
                          <Input
                            id="email"
                            type="email"
                            value={deleteAccountForm.email}
                            onChange={(e) => setDeleteAccountForm(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="Inserisci la tua email"
                            required
                          />
                        </div>
                        <div>
                          <label htmlFor="reason" className="block text-sm font-medium text-white mb-1">
                            Motivo della cancellazione
                          </label>
                          <Textarea
                            id="reason"
                            value={deleteAccountForm.reason}
                            onChange={(e) => setDeleteAccountForm(prev => ({ ...prev, reason: e.target.value }))}
                            placeholder="Specifica il motivo della richiesta di cancellazione"
                            required
                            className="min-h-[100px]"
                          />
                        </div>
                        <Button 
                          onClick={handleDeleteAccountRequest}
                          variant="destructive"
                          className="w-full"
                        >
                          Invia Richiesta
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Impostazioni di Sicurezza */}
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
        
        {/* Cambia Password */}
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
        
        {/* Impostazioni Privacy */}
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
