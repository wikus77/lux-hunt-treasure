
import { useState } from "react";
import { Shield, FileText, Download, Trash2, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const PrivacySecuritySection = () => {
  const { toast } = useToast();
  const [isPrivacySectionOpen, setIsPrivacySectionOpen] = useState(false);
  const [showDeleteForm, setShowDeleteForm] = useState(false);
  const [deleteFormData, setDeleteFormData] = useState({
    email: "",
    reason: ""
  });

  const handleDownloadPrivacyPolicy = () => {
    toast({
      title: "Download Avviato",
      description: "Il documento della Privacy Policy è in download."
    });
  };

  const handleDeleteFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDeleteFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeleteRequest = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!deleteFormData.email || !deleteFormData.reason) {
      toast({
        title: "Errore",
        description: "Compila tutti i campi richiesti.",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Richiesta Inviata",
      description: "La tua richiesta di cancellazione è stata inviata. Riceverai conferma via email entro 72 ore."
    });
    
    setDeleteFormData({ email: "", reason: "" });
    setShowDeleteForm(false);
  };

  return (
    <div className="mb-6">
      <div className="glass-card p-4">
        <Collapsible open={isPrivacySectionOpen} onOpenChange={setIsPrivacySectionOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-0">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Shield className="h-5 w-5 mr-3 text-projectx-neon-blue" />
              Privacy e Sicurezza
            </h2>
            <ChevronRight 
              className={`h-4 w-4 transition-transform ${isPrivacySectionOpen ? 'rotate-90' : ''}`} 
            />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4">
            <ScrollArea className="h-[400px] w-full rounded-lg border border-white/10 p-4 bg-black/20">
              <div className="space-y-6 text-white">
                <div>
                  <h3 className="text-lg font-bold text-projectx-neon-blue mb-2">Privacy e Sicurezza — M1SSION™</h3>
                </div>

                <div className="p-3 border border-white/10 rounded-lg bg-black/30">
                  <h4 className="text-md font-semibold mb-2">Titolare del trattamento</h4>
                  <p className="text-sm text-muted-foreground">M1SSION™ KFT</p>
                  <p className="text-sm text-muted-foreground">Sede legale: 1077 Budapest, Izabella utca 2 alagsor 1</p>
                  <p className="text-sm text-muted-foreground">Email contatto: privacy@m1ssion.com</p>
                </div>

                <Separator className="border-white/10" />

                <div className="p-3 border border-white/10 rounded-lg bg-black/30">
                  <h4 className="text-md font-semibold mb-2">Finalità del trattamento</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Gestione dell'account e autenticazione</li>
                    <li>Gestione delle missioni e della classifica</li>
                    <li>Tracciamento dell'attività utente all'interno dell'app</li>
                    <li>Notifiche, aggiornamenti e comunicazioni (solo se acconsentito)</li>
                    <li>Gestione di pagamenti, piani, e premi</li>
                    <li>Analisi e miglioramento dei servizi</li>
                    <li>Adempimenti legali e antifrode</li>
                  </ul>
                </div>

                <Separator className="border-white/10" />

                <div className="p-3 border border-white/10 rounded-lg bg-black/30">
                  <h4 className="text-md font-semibold mb-2">Dati trattati</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Dati identificativi: nome, email, indirizzo IP</li>
                    <li>Dati di geolocalizzazione (solo con consenso e per gioco attivo)</li>
                    <li>Dati tecnici (dispositivo, browser, sistema operativo)</li>
                    <li>Dati di pagamento (mai conservati su M1SSION™, ma su Stripe)</li>
                    <li>Attività di gioco (BUZZ, indizi sbloccati, premi, XP)</li>
                  </ul>
                </div>

                <Separator className="border-white/10" />

                <div className="p-3 border border-white/10 rounded-lg bg-black/30">
                  <h4 className="text-md font-semibold mb-2">Base giuridica del trattamento</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Esecuzione del contratto (Art. 6.1.b GDPR)</li>
                    <li>Consenso esplicito (Art. 6.1.a)</li>
                    <li>Obblighi di legge (Art. 6.1.c)</li>
                    <li>Interesse legittimo del titolare (Art. 6.1.f)</li>
                  </ul>
                </div>

                <Separator className="border-white/10" />

                <div className="p-3 border border-white/10 rounded-lg bg-black/30">
                  <h4 className="text-md font-semibold mb-2">Conservazione dei dati</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>I dati sono conservati per il tempo strettamente necessario all'erogazione del servizio</li>
                    <li>I log di gioco sono conservati per massimo 24 mesi</li>
                    <li>I dati di pagamento sono gestiti da Stripe e non vengono mai salvati su Supabase o sistemi interni</li>
                  </ul>
                </div>

                <Separator className="border-white/10" />

                <div className="p-3 border border-white/10 rounded-lg bg-black/30">
                  <h4 className="text-md font-semibold mb-2">Diritti dell'utente (Art. 12–22 GDPR)</h4>
                  <p className="text-sm text-muted-foreground mb-2">Ogni utente ha il diritto di:</p>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>Accedere ai propri dati</li>
                    <li>Correggerli o aggiornarli</li>
                    <li>Revocare il consenso in qualsiasi momento</li>
                    <li>Chiedere la cancellazione del proprio account e dei dati</li>
                    <li>Ottenere una copia in formato strutturato (portabilità)</li>
                    <li>Opporsi al trattamento o limitarlo</li>
                    <li>Proporre reclamo all'autorità competente (Garante Privacy)</li>
                  </ul>
                </div>

                <Separator className="border-white/10" />

                <div className="p-3 border border-white/10 rounded-lg bg-black/30">
                  <h4 className="text-md font-semibold mb-2">Cookie e tracciamenti</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>L'app utilizza solo cookie tecnici essenziali.</li>
                    <li>Su m1ssion.com (versione web) è attivo Cookiebot per il consenso personalizzato.</li>
                    <li>Google Analytics 4 viene attivato solo se l'utente acconsente esplicitamente.</li>
                  </ul>
                </div>

                <Separator className="border-white/10" />

                <div className="p-3 border border-white/10 rounded-lg bg-black/30">
                  <h4 className="text-md font-semibold mb-2">Sicurezza tecnica</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>I dati sono cifrati in transito (TLS/SSL) e a riposo (AES-256)</li>
                    <li>Accesso protetto tramite autenticazione JWT su Supabase</li>
                    <li>Monitoraggio antifrode e logging centralizzato</li>
                    <li>Accesso ai dati limitato ai ruoli autorizzati tramite RLS attive su tutte le tabelle</li>
                  </ul>
                </div>
              </div>
            </ScrollArea>

            <div className="mt-6 space-y-4">
              <div className="flex gap-4">
                <Button 
                  onClick={handleDownloadPrivacyPolicy}
                  className="flex-1 bg-gradient-to-r from-projectx-blue to-projectx-pink rounded-lg"
                >
                  <Download className="h-4 w-4 mr-2" />
                  📄 Scarica Privacy Policy (PDF)
                </Button>
                
                <Button 
                  variant="destructive"
                  onClick={() => setShowDeleteForm(!showDeleteForm)}
                  className="flex-1 rounded-lg"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  🗑️ Richiedi cancellazione account
                </Button>
              </div>

              {showDeleteForm && (
                <div className="border border-red-500/30 rounded-lg bg-red-950/20 p-4">
                  <h4 className="text-lg font-semibold mb-4">Richiesta Cancellazione Account</h4>
                  <form onSubmit={handleDeleteRequest} className="space-y-4">
                    <div>
                      <label htmlFor="deleteEmail" className="block text-sm font-medium mb-1">
                        Email di conferma
                      </label>
                      <Input
                        id="deleteEmail"
                        name="email"
                        type="email"
                        value={deleteFormData.email}
                        onChange={handleDeleteFormChange}
                        placeholder="Inserisci la tua email"
                        className="rounded-lg"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="deleteReason" className="block text-sm font-medium mb-1">
                        Motivo della cancellazione
                      </label>
                      <Textarea
                        id="deleteReason"
                        name="reason"
                        value={deleteFormData.reason}
                        onChange={handleDeleteFormChange}
                        placeholder="Spiega il motivo per cui vuoi cancellare il tuo account..."
                        rows={3}
                        className="rounded-lg"
                        required
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        type="submit"
                        variant="destructive"
                        className="flex-1 rounded-lg"
                      >
                        Invia Richiesta
                      </Button>
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setShowDeleteForm(false)}
                        className="rounded-lg"
                      >
                        Annulla
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default PrivacySecuritySection;
