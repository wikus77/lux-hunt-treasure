
import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import UnifiedHeader from "@/components/layout/UnifiedHeader";

const CookiePolicy: React.FC = () => {
  return (
    <PublicLayout>
      <UnifiedHeader />
      <div className="h-[72px] w-full" />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Link 
          to="/" 
          className="inline-flex items-center text-white/70 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Torna alla home
        </Link>
        
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">Cookie Policy</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-white/80">
            Ultimo aggiornamento: maggio 2025
          </p>
          
          <p>
            Questa Cookie Policy spiega cosa sono i cookie e come li utilizziamo sul sito https://m1ssion.com, 
            in conformità al Regolamento (UE) 2016/679 (GDPR) e alla Direttiva ePrivacy.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">1. COSA SONO I COOKIE?</h2>
          <p>
            I cookie sono piccoli file di testo che i siti visitati inviano al dispositivo dell'utente, 
            dove vengono memorizzati per essere poi ritrasmessi agli stessi siti alla visita successiva.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">2. BASE GIURIDICA DEL TRATTAMENTO</h2>
          <p>
            Il trattamento dei cookie tecnici è basato sul legittimo interesse del titolare. 
            Tutti gli altri cookie vengono utilizzati solo previo consenso dell'utente.
          </p>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">3. TIPOLOGIE DI COOKIE UTILIZZATI</h2>
          <p>
            Su questo sito utilizziamo le seguenti categorie di cookie:
          </p>
          
          <ul className="list-disc pl-6 space-y-4 mt-4">
            <li>
              <span className="font-medium">Cookie tecnici</span><br />
              Necessari per il corretto funzionamento del sito e per l'erogazione dei servizi richiesti dall'utente. 
              Non richiedono consenso.
            </li>
            
            <li>
              <span className="font-medium">Cookie analitici (statistici)</span><br />
              Utilizzati per raccogliere informazioni in forma aggregata e anonima sull'uso del sito 
              (pagine visitate, tempo di permanenza, provenienza geografica).<br />
              Viene utilizzato Google Analytics 4 con anonimizzazione dell'IP attiva. 
              Questi cookie vengono installati solo previo consenso.
            </li>
            
            <li>
              <span className="font-medium">Cookie di gestione consenso (Cookiebot)</span><br />
              Utilizzati per memorizzare le preferenze di consenso espresse dall'utente. 
              Servono a ricordare quali categorie di cookie sono state accettate o rifiutate.
            </li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">4. COME GESTIRE I COOKIE</h2>
          <p>
            Al primo accesso al sito, un banner (fornito da Cookiebot) consente all'utente di:
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Accettare tutti i cookie</li>
            <li>Rifiutare i cookie non essenziali</li>
            <li>Personalizzare le preferenze per ciascuna categoria</li>
          </ul>
          
          <p className="mt-4">
            Il banner può essere riaperto in qualsiasi momento cliccando su "Modifica preferenze cookie" nel footer del sito.
          </p>
          
          <p className="mt-4">
            È inoltre possibile disabilitare i cookie direttamente dalle impostazioni del proprio browser. 
            Di seguito i link alle guide ufficiali:
          </p>
          
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>
              <a 
                href="https://support.google.com/accounts/answer/61416" 
                target="_blank" 
                rel="noreferrer"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Google Chrome
              </a>
            </li>
            <li>
              <a 
                href="https://support.mozilla.org/it/kb/Gestione%20dei%20cookie" 
                target="_blank" 
                rel="noreferrer"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Mozilla Firefox
              </a>
            </li>
            <li>
              <a 
                href="https://support.apple.com/it-it/guide/safari/sfri11471/mac" 
                target="_blank" 
                rel="noreferrer"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Apple Safari
              </a>
            </li>
            <li>
              <a 
                href="https://support.microsoft.com/it-it/help/4027947" 
                target="_blank" 
                rel="noreferrer"
                className="text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                Microsoft Edge
              </a>
            </li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">5. DURATA DEI COOKIE</h2>
          <p>
            La durata dei cookie varia a seconda della tipologia:
          </p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>Cookie di sessione: cancellati alla chiusura del browser</li>
            <li>Cookie persistenti: rimangono per un periodo massimo di 12 mesi</li>
          </ul>
          
          <h2 className="text-xl font-semibold mt-8 mb-4">6. AGGIORNAMENTI</h2>
          <p>
            La presente Cookie Policy può essere aggiornata. Si consiglia di consultarla periodicamente.<br />
            Per maggiori informazioni: <a href="mailto:contact@m1ssion.com" className="text-cyan-400 hover:text-cyan-300 transition-colors">contact@m1ssion.com</a>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
};

export default CookiePolicy;
