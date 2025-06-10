
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const CookiePolicy: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white p-4 pt-20">
      <div className="container mx-auto max-w-4xl">
        <Link to="/">
          <Button variant="outline" className="mb-8">
            <ArrowLeft className="mr-2 w-4 h-4" /> Torna alla Home
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold mb-6 gradient-text-cyan">Cookie Policy</h1>
        
        <div className="space-y-6 text-gray-300">
          <p className="text-lg">
            Il sito M1SSION utilizza cookie tecnici necessari e, previo consenso, cookie analitici per migliorare l'esperienza utente.
          </p>
          
          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">1. Cosa sono i cookie?</h2>
            <p>
              I cookie sono piccoli file di testo salvati nel dispositivo dell'utente durante la navigazione, che permettono di riconoscere il dispositivo e memorizzare informazioni sulla navigazione.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">2. Tipologie di cookie utilizzati</h2>
            
            <div className="space-y-4">
              <div className="bg-green-900/20 p-4 rounded-lg border border-green-500/30">
                <h3 className="font-semibold text-green-400 mb-2">🟢 Cookie Tecnici (Sempre attivi)</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Autenticazione</strong>: gestione sessioni utente</li>
                  <li><strong>Sicurezza</strong>: Cloudflare Turnstile per protezione anti-bot</li>
                  <li><strong>Preferenze</strong>: salvataggio impostazioni lingua e tema</li>
                  <li><strong>Carrello</strong>: memorizzazione selezioni durante l'acquisto</li>
                </ul>
                <p className="text-sm mt-2 text-green-300">
                  Base giuridica: Interesse legittimo (art. 6 par. 1 lett. f GDPR) - Essenziali per il funzionamento
                </p>
              </div>
              
              <div className="bg-blue-900/20 p-4 rounded-lg border border-blue-500/30">
                <h3 className="font-semibold text-blue-400 mb-2">🔵 Cookie Analitici (Solo con consenso)</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li><strong>Google Analytics 4</strong>: analisi utilizzo sito in forma anonima</li>
                  <li><strong>Statistiche performance</strong>: miglioramento funzionalità</li>
                </ul>
                <p className="text-sm mt-2 text-blue-300">
                  Base giuridica: Consenso esplicito (art. 6 par. 1 lett. a GDPR)
                </p>
              </div>
              
              <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-500/30">
                <h3 className="font-semibold text-gray-400 mb-2">⚫ Cookie NON utilizzati</h3>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Cookie di profilazione pubblicitaria</li>
                  <li>Cookie di tracciamento cross-site</li>
                  <li>Cookie di social media (pulsanti condivisione diretti)</li>
                </ul>
              </div>
            </div>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">3. Gestione delle preferenze</h2>
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <p className="mb-3">Puoi gestire i tuoi consensi:</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Tramite il banner visualizzato alla prima visita</li>
                <li>Modificando le impostazioni del browser</li>
                <li>Contattando <a href="mailto:privacy@m1ssion.com" className="text-[#00E5FF] hover:underline">privacy@m1ssion.com</a></li>
              </ul>
            </div>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">4. Cookie di terze parti</h2>
            <div className="space-y-3">
              <div className="bg-white/5 p-3 rounded border border-white/10">
                <p><strong>Cloudflare</strong> - Protezione e performance</p>
                <p className="text-sm">Necessari per sicurezza e velocità del sito</p>
              </div>
              <div className="bg-white/5 p-3 rounded border border-white/10">
                <p><strong>Google Analytics 4</strong> - Solo con consenso</p>
                <p className="text-sm">Statistiche anonime di utilizzo</p>
              </div>
              <div className="bg-white/5 p-3 rounded border border-white/10">
                <p><strong>Supabase</strong> - Database e autenticazione</p>
                <p className="text-sm">Cookie tecnici per gestione account</p>
              </div>
            </div>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">5. Durata dei cookie</h2>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Sessione</strong>: cancellati alla chiusura del browser</li>
              <li><strong>Persistenti</strong>: massimo 25 mesi (Analytics), 12 mesi (Preferenze)</li>
              <li><strong>Sicurezza</strong>: variabile in base alle esigenze di protezione</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">6. Disabilitazione cookie</h2>
            <p className="mb-3">
              Puoi disabilitare i cookie attraverso le impostazioni del tuo browser. Nota che disabilitare i cookie tecnici potrebbe compromettere alcune funzionalità del sito.
            </p>
            <div className="text-sm space-y-1">
              <p><strong>Chrome:</strong> Impostazioni → Privacy e sicurezza → Cookie</p>
              <p><strong>Firefox:</strong> Preferenze → Privacy e sicurezza</p>
              <p><strong>Safari:</strong> Preferenze → Privacy</p>
              <p><strong>Edge:</strong> Impostazioni → Cookie e autorizzazioni sito</p>
            </div>
          </section>
          
          <div className="bg-gradient-to-r from-[#00E5FF]/20 to-blue-600/20 p-4 rounded-lg border border-[#00E5FF]/30 mt-8">
            <p className="text-sm italic">
              <strong>Ultimo aggiornamento:</strong> Giugno 2025<br/>
              <strong>Conformità:</strong> GDPR, Direttiva ePrivacy<br/>
              <strong>Gestione consensi:</strong> Sistema proprietario (no Cookiebot)
            </p>
          </div>
        </div>
        
        <div className="mt-10 mb-10 text-center">
          <Link to="/">
            <Button className="bg-gradient-to-r from-[#00E5FF] to-blue-600 hover:opacity-90 text-black font-medium">
              Torna alla Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
