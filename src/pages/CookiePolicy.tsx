
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
        
        <h1 className="text-3xl font-bold mb-6">Cookie Policy</h1>
        
        <div className="space-y-6">
          <p className="text-gray-300">
            Il sito M1SSION utilizza cookie tecnici e, previo consenso, cookie analitici e di profilazione.
          </p>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Cosa sono i cookie?</h2>
            <p className="text-gray-300">
              I cookie sono piccoli file di testo salvati nel dispositivo dell'utente durante la navigazione.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">2. Tipologie di cookie usati</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
              <li><strong>Tecnici</strong>: necessari per il funzionamento del sito</li>
              <li><strong>Analitici</strong>: raccolgono informazioni anonime sull'utilizzo del sito</li>
              <li><strong>Di profilazione</strong>: utilizzati per personalizzare contenuti e annunci pubblicitari</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">3. Gestione dei cookie</h2>
            <p className="text-gray-300">
              Puoi modificare o revocare il tuo consenso in qualsiasi momento tramite il nostro banner cookie (gestito con Cookiebot).
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">4. Terze parti</h2>
            <p className="text-gray-300">
              Utilizziamo servizi come Google Analytics 4, attivati solo se esprimi consenso.
            </p>
          </section>
          
          <div className="mt-8">
            <p className="text-gray-300">
              Per dettagli completi, visita: <a href="https://www.cookiebot.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">www.cookiebot.com</a>
            </p>
            <p className="text-gray-300 italic mt-2">
              Ultimo aggiornamento: Maggio 2025
            </p>
          </div>
        </div>
        
        <div className="mt-10 mb-10 text-center">
          <Link to="/">
            <Button className="bg-gradient-to-r from-projectx-blue to-projectx-pink">
              Torna alla Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
