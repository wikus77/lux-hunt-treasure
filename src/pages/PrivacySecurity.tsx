
import React, { useState } from 'react';
import { ArrowLeft, Shield, FileText, Trash2, Download, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const PrivacySecurity = () => {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const handleDownloadPolicy = () => {
    toast.info('Download Privacy Policy in preparazione');
    // Future implementation: generate or download PDF
  };

  const handleDeleteRequest = () => {
    if (!userEmail.trim() || !deleteReason.trim()) {
      toast.error('Compila tutti i campi richiesti');
      return;
    }
    
    toast.success('Richiesta di cancellazione inviata');
    setShowDeleteDialog(false);
    setUserEmail('');
    setDeleteReason('');
    // Future implementation: send deletion request
  };

  const privacyContent = `
**🛡️ Privacy e Sicurezza — M1SSION™**

**Titolare del trattamento**
M1SSION™ KFT
Sede legale: 1077 Budapest, Izabella utca 2 alagsor 1
Email contatto: contact@m1ssion.com

**Finalità del trattamento**

• Gestione dell'account e autenticazione
• Gestione delle missioni e della classifica
• Tracciamento dell'attività utente all'interno dell'app
• Notifiche, aggiornamenti e comunicazioni (solo se acconsentito)
• Gestione di pagamenti, piani, e premi
• Analisi e miglioramento dei servizi
• Adempimenti legali e antifrode

**Dati trattati**

• Dati identificativi: nome, email, indirizzo IP
• Dati di geolocalizzazione (solo con consenso e per gioco attivo)
• Dati tecnici (dispositivo, browser, sistema operativo)
• Dati di pagamento (mai conservati su M1SSION™, ma su Stripe)
• Attività di gioco (BUZZ, indizi sbloccati, premi, XP)

**Base giuridica del trattamento**

• Esecuzione del contratto (Art. 6.1.b GDPR)
• Consenso esplicito (Art. 6.1.a)
• Obblighi di legge (Art. 6.1.c)
• Interesse legittimo del titolare (Art. 6.1.f)

**Conservazione dei dati**

• I dati sono conservati per il tempo strettamente necessario all'erogazione del servizio
• I log di gioco sono conservati per massimo 24 mesi
• I dati di pagamento sono gestiti da Stripe e non vengono mai salvati su Supabase o sistemi interni

**Diritti dell'utente (Art. 12–22 GDPR)**
Ogni utente ha il diritto di:

• Accedere ai propri dati
• Correggerli o aggiornarli
• Revocare il consenso in qualsiasi momento
• Chiedere la cancellazione del proprio account e dei dati
• Ottenere una copia in formato strutturato (portabilità)
• Opporsi al trattamento o limitarlo
• Proporre reclamo all'autorità competente (Garante Privacy)

**Cookie e tracciamenti**

• L'app utilizza solo cookie tecnici essenziali
• Su m1ssion.com (versione web) è attivo Cookiebot per il consenso personalizzato
• Google Analytics 4 viene attivato solo se l'utente acconsente esplicitamente

**Sicurezza tecnica**

• I dati sono cifrati in transito (TLS/SSL) e a riposo (AES-256)
• Accesso protetto tramite autenticazione JWT su Supabase
• Monitoraggio antifrode e logging centralizzato
• Accesso ai dati limitato ai ruoli autorizzati tramite RLS attive su tutte le tabelle
`;

  return (
    <div className="min-h-screen bg-black pb-6 w-full">
      <header className="fixed top-0 left-0 right-0 z-40 w-full px-4 py-6 flex items-center border-b border-projectx-deep-blue glass-backdrop transition-colors duration-300">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-projectx-neon-blue" />
          Privacy e Sicurezza
        </h1>
      </header>
      
      <div className="h-[72px] w-full" />
      
      <div className="p-4">
        <div className="glass-card mb-6">
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5 text-projectx-neon-blue" />
              Informativa GDPR & Sicurezza
            </h2>
          </div>
          
          <ScrollArea className="h-[60vh] px-6 py-4">
            <div className="prose prose-invert max-w-none text-sm text-white leading-relaxed">
              <div className="whitespace-pre-line">
                {privacyContent}
              </div>
            </div>
          </ScrollArea>
          
          <Separator className="bg-white/10" />
          
          <div className="p-4 space-y-4">
            <Button 
              onClick={handleDownloadPolicy}
              className="w-full bg-gradient-to-r from-projectx-blue to-projectx-pink flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              📄 Scarica Privacy Policy (PDF)
            </Button>
            
            <Button 
              onClick={() => setShowDeleteDialog(true)}
              variant="destructive"
              className="w-full flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              🗑️ Richiedi cancellazione account
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md bg-black/95 backdrop-blur-md border border-white/10">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
              <Trash2 className="h-6 w-6 text-red-500" />
              Richiesta Cancellazione Account
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Email Account
              </label>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full p-3 rounded-md bg-zinc-800 border border-zinc-600 text-white placeholder-zinc-400"
                placeholder="La tua email registrata"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Motivo della cancellazione
              </label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                rows={4}
                className="w-full p-3 rounded-md bg-zinc-800 border border-zinc-600 text-white placeholder-zinc-400 resize-none"
                placeholder="Spiega brevemente il motivo della richiesta..."
              />
            </div>
            
            <div className="bg-red-950/20 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400 text-sm">
                ⚠️ Attenzione: La cancellazione dell'account è irreversibile e comporterà la perdita di tutti i dati, progressi e premi accumulati.
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => setShowDeleteDialog(false)}
              >
                Annulla
              </Button>
              <Button 
                variant="destructive" 
                className="flex-1 flex items-center gap-2" 
                onClick={handleDeleteRequest}
              >
                <Mail className="h-4 w-4" />
                Invia Richiesta
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrivacySecurity;
