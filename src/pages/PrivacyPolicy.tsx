
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white p-4 pt-20">
      <div className="container mx-auto max-w-3xl mb-16">
        <div className="mb-8">
          <Link to="/">
            <Button variant="outline" className="mb-8">
              <ArrowLeft className="mr-2 w-4 h-4" /> Torna alla Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
          <p className="text-gray-400 mb-8">
            Ultimo aggiornamento: 21 Aprile 2025
          </p>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Introduzione</h2>
            <p className="text-gray-300">
              La presente Privacy Policy descrive le modalità con cui M1SSION raccoglie, utilizza, divulga e protegge le informazioni personali degli utenti che utilizzano la nostra piattaforma. Rispettiamo la tua privacy e ci impegniamo a proteggere i tuoi dati personali in conformità con le leggi applicabili sulla protezione dei dati.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Informazioni che raccogliamo</h2>
            <p className="text-gray-300 mb-3">
              Possiamo raccogliere e trattare le seguenti categorie di dati personali:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>Informazioni di registrazione (nome, indirizzo email, password)</li>
              <li>Dati demografici (età, sesso, posizione)</li>
              <li>Informazioni di contatto</li>
              <li>Dati relativi al dispositivo e all'utilizzo della piattaforma</li>
              <li>Informazioni di pagamento (gestite in modo sicuro attraverso i nostri processori di pagamento)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Come utilizziamo le informazioni</h2>
            <p className="text-gray-300 mb-3">
              Utilizziamo i dati personali per:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>Fornire, gestire e migliorare i nostri servizi</li>
              <li>Personalizzare l'esperienza utente</li>
              <li>Comunicare con gli utenti riguardo al loro account</li>
              <li>Inviare aggiornamenti, notifiche e informazioni promozionali</li>
              <li>Garantire la sicurezza della piattaforma</li>
              <li>Prevenire frodi e abusi</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Condivisione delle informazioni</h2>
            <p className="text-gray-300">
              Non vendiamo, affittiamo o condividiamo le tue informazioni personali con terze parti ad eccezione di quanto descritto in questa Privacy Policy. Potremmo condividere informazioni con fornitori di servizi di terze parti che ci aiutano a fornire e migliorare i nostri servizi, con partner commerciali previa tua autorizzazione, o quando richiesto dalla legge.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Sicurezza dei dati</h2>
            <p className="text-gray-300">
              Implementiamo misure di sicurezza tecniche e organizzative appropriate per proteggere i tuoi dati personali contro l'accesso non autorizzato, l'alterazione, la divulgazione o la distruzione. Tuttavia, nessun metodo di trasmissione su Internet o metodo di archiviazione elettronica è sicuro al 100%.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. I tuoi diritti</h2>
            <p className="text-gray-300 mb-3">
              A seconda della tua giurisdizione, potresti avere i seguenti diritti relativi ai tuoi dati personali:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>Diritto di accesso e copia</li>
              <li>Diritto di rettifica</li>
              <li>Diritto alla cancellazione</li>
              <li>Diritto alla limitazione del trattamento</li>
              <li>Diritto alla portabilità dei dati</li>
              <li>Diritto di opposizione</li>
              <li>Diritto di revocare il consenso</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Cookie e tecnologie simili</h2>
            <p className="text-gray-300">
              Utilizziamo cookie e tecnologie simili per migliorare l'esperienza utente, analizzare l'utilizzo della piattaforma e personalizzare i contenuti. Puoi modificare le tue preferenze sui cookie attraverso le impostazioni del tuo browser.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Modifiche alla Privacy Policy</h2>
            <p className="text-gray-300">
              Potremmo aggiornare periodicamente questa Privacy Policy per riflettere cambiamenti nelle nostre pratiche o per altri motivi operativi, legali o normativi. Ti invitiamo a rivedere regolarmente questa pagina per rimanere informato sulle nostre pratiche di privacy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Contattaci</h2>
            <p className="text-gray-300">
              Se hai domande, preoccupazioni o richieste relative a questa Privacy Policy o al trattamento dei tuoi dati personali, non esitare a contattarci all'indirizzo email: privacy@m1ssion.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
