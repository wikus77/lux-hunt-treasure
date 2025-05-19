
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
        
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        
        <div className="space-y-6">
          <p className="text-gray-300">
            La presente informativa descrive le modalità con cui M1SSION raccoglie, utilizza e protegge i dati personali degli utenti, in conformità al Regolamento UE 2016/679 (GDPR).
          </p>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Titolare del trattamento</h2>
            <p className="text-gray-300">
              Il titolare del trattamento è [Nome Società], con sede in [Indirizzo], email: [email@azienda].
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">2. Dati trattati</h2>
            <p className="text-gray-300">
              Raccogliamo dati personali come nome, email, posizione geografica (se autorizzata), dati di navigazione e contenuti generati dall'utente.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">3. Finalità del trattamento</h2>
            <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
              <li>Fornitura dei servizi dell'app</li>
              <li>Analisi e miglioramento dell'esperienza utente</li>
              <li>Comunicazioni relative a missioni e premi</li>
              <li>Adempimenti legali</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">4. Conservazione dei dati</h2>
            <p className="text-gray-300">
              I dati sono conservati per il tempo necessario al raggiungimento delle finalità indicate, salvo obblighi legali.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">5. Diritti dell'utente</h2>
            <p className="text-gray-300">
              Hai diritto di accesso, rettifica, cancellazione, limitazione, portabilità e opposizione al trattamento.<br />
              Per esercitarli scrivi a [email@azienda].
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">6. Cookie e strumenti di tracciamento</h2>
            <p className="text-gray-300">
              Consulta la nostra <Link to="/cookie-policy" className="text-blue-400 hover:underline">Cookie Policy</Link> per maggiori informazioni.
            </p>
          </section>
          
          <p className="text-gray-300 italic mt-8">
            Ultimo aggiornamento: Maggio 2025
          </p>
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

export default PrivacyPolicy;
