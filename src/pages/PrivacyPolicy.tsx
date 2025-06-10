
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white p-4 pt-20">
      <div className="container mx-auto max-w-4xl">
        <Link to="/">
          <Button variant="outline" className="mb-8">
            <ArrowLeft className="mr-2 w-4 h-4" /> Torna alla Home
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold mb-6 gradient-text-cyan">Privacy Policy</h1>
        
        <div className="space-y-6 text-gray-300">
          <p className="text-lg">
            La presente informativa descrive le modalità con cui M1SSION KFT raccoglie, utilizza e protegge i dati personali degli utenti, in conformità al Regolamento UE 2016/679 (GDPR).
          </p>
          
          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">1. Titolare del trattamento</h2>
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <p><strong>M1SSION KFT</strong></p>
              <p>Sede legale: 1077 Budapest, Izabella utca 2 alagsor 1, Ungheria</p>
              <p>Email privacy: <a href="mailto:privacy@m1ssion.com" className="text-[#00E5FF] hover:underline">privacy@m1ssion.com</a></p>
              <p>Contatti generali: <Link to="/contatti" className="text-[#00E5FF] hover:underline">Pagina Contatti</Link></p>
            </div>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">2. Dati trattati</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Dati di registrazione</strong>: nome, cognome, email, data di nascita</li>
              <li><strong>Dati di geolocalizzazione</strong>: coordinate GPS (solo se autorizzate dall'utente)</li>
              <li><strong>Dati di navigazione</strong>: cookie tecnici, log di accesso, preferenze utente</li>
              <li><strong>Contenuti generati</strong>: note, progressi di gioco, messaggi nell'app</li>
              <li><strong>Dati di pagamento</strong>: gestiti esclusivamente da Stripe (dati non memorizzati sui nostri server)</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">3. Finalità e base giuridica del trattamento</h2>
            <div className="space-y-3">
              <div className="bg-white/5 p-3 rounded border border-white/10">
                <p><strong>Registrazione e autenticazione</strong></p>
                <p className="text-sm">Base giuridica: consenso esplicito (art. 6, par. 1, lett. a GDPR)</p>
              </div>
              <div className="bg-white/5 p-3 rounded border border-white/10">
                <p><strong>Invio indizi e gestione missioni</strong></p>
                <p className="text-sm">Base giuridica: esecuzione contratto/servizio (art. 6, par. 1, lett. b GDPR)</p>
              </div>
              <div className="bg-white/5 p-3 rounded border border-white/10">
                <p><strong>Analisi e miglioramento servizi</strong></p>
                <p className="text-sm">Base giuridica: consenso (art. 6, par. 1, lett. a GDPR) - solo con Google Analytics 4</p>
              </div>
              <div className="bg-white/5 p-3 rounded border border-white/10">
                <p><strong>Comunicazioni di marketing</strong></p>
                <p className="text-sm">Base giuridica: consenso esplicito (art. 6, par. 1, lett. a GDPR)</p>
              </div>
            </div>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">4. Hosting e archiviazione dati</h2>
            <p>I dati sono memorizzati su server Supabase ubicati nell'Unione Europea, garantendo conformità al GDPR e adeguate misure di sicurezza.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">5. Sicurezza e protezione</h2>
            <p>Utilizziamo Cloudflare Turnstile per la protezione anti-spam e anti-bot, garantendo la sicurezza senza tracciamento invasivo.</p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">6. Conservazione dei dati</h2>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Dati account: fino alla cancellazione dell'account</li>
              <li>Dati di navigazione: massimo 25 mesi</li>
              <li>Log di sicurezza: massimo 12 mesi</li>
              <li>Dati di marketing: fino alla revoca del consenso</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">7. Diritti dell'utente</h2>
            <p className="mb-3">Hai diritto a:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong>Accesso</strong>: ottenere copia dei tuoi dati</li>
              <li><strong>Rettifica</strong>: correggere dati inesatti</li>
              <li><strong>Cancellazione</strong>: richiedere la cancellazione</li>
              <li><strong>Limitazione</strong>: limitare il trattamento</li>
              <li><strong>Portabilità</strong>: ricevere i dati in formato strutturato</li>
              <li><strong>Opposizione</strong>: opporsi al trattamento</li>
              <li><strong>Revoca consenso</strong>: ritirare il consenso in qualsiasi momento</li>
            </ul>
            <p className="mt-3">
              Per esercitare i tuoi diritti scrivi a: <a href="mailto:privacy@m1ssion.com" className="text-[#00E5FF] hover:underline">privacy@m1ssion.com</a>
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">8. Cookie e strumenti di tracciamento</h2>
            <p>
              Per informazioni dettagliate sui cookie utilizzati, consulta la nostra <Link to="/cookie-policy" className="text-[#00E5FF] hover:underline">Cookie Policy</Link>.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3 text-white">9. Reclami</h2>
            <p>
              Hai diritto di presentare reclamo all'Autorità Garante per la protezione dei dati personali competente nel tuo paese di residenza.
            </p>
          </section>
          
          <div className="bg-gradient-to-r from-[#00E5FF]/20 to-blue-600/20 p-4 rounded-lg border border-[#00E5FF]/30 mt-8">
            <p className="text-sm italic">
              <strong>Ultimo aggiornamento:</strong> Giugno 2025<br/>
              <strong>Versione:</strong> 1.0 - Conforme GDPR
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

export default PrivacyPolicy;
