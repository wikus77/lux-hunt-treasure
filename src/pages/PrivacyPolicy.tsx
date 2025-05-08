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
        
        <h1 className="text-3xl font-bold mb-6">Informativa sulla Privacy</h1>
        
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Introduzione</h2>
            <p className="text-gray-300">
              M1SSION si impegna a proteggere la tua privacy. La presente Informativa sulla Privacy descrive come raccogliamo, utilizziamo e divulghiamo le tue informazioni personali quando utilizzi il nostro servizio.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">2. Raccolta dei Dati</h2>
            <p className="text-gray-300 mb-3">
              Raccogliamo diversi tipi di informazioni per vari scopi al fine di fornirti e migliorare il nostro Servizio.
            </p>
            <h3 className="text-lg font-medium mb-2">Dati Personali</h3>
            <p className="text-gray-300 mb-3">
              Quando utilizzi il nostro Servizio, potremmo chiederti di fornirci alcune informazioni di identificazione personale che possono essere utilizzate per contattarti o identificarti, inclusi ma non limitati a:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
              <li>Indirizzo email</li>
              <li>Nome e cognome</li>
              <li>Data di nascita</li>
              <li>Numero di telefono</li>
              <li>Indirizzo, Stato, Provincia, CAP, Città</li>
              <li>Cookie e dati di utilizzo</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">3. Utilizzo dei Dati</h2>
            <p className="text-gray-300 mb-3">
              M1SSION utilizza i dati raccolti per vari scopi:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
              <li>Fornire e mantenere il nostro Servizio</li>
              <li>Notificarti riguardo ai cambiamenti del nostro Servizio</li>
              <li>Permetterti di partecipare alle funzionalità interattive del nostro Servizio quando scegli di farlo</li>
              <li>Fornire assistenza clienti</li>
              <li>Raccogliere analisi o informazioni preziose in modo da poter migliorare il nostro Servizio</li>
              <li>Monitorare l'utilizzo del nostro Servizio</li>
              <li>Rilevare, prevenire e affrontare problemi tecnici</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">4. Trasferimento dei Dati</h2>
            <p className="text-gray-300">
              Le tue informazioni, compresi i Dati Personali, potrebbero essere trasferite - e mantenute su - computer situati al di fuori del tuo stato, provincia, paese o altra giurisdizione dove le leggi sulla protezione dei dati potrebbero essere diverse da quelle della tua giurisdizione. Il tuo consenso a questa Informativa sulla Privacy seguito dalla tua presentazione di tali informazioni rappresenta il tuo consenso a tale trasferimento.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">5. Divulgazione dei Dati</h2>
            <p className="text-gray-300 mb-3">
              M1SSION può divulgare i tuoi Dati Personali in buona fede credendo che tale azione sia necessaria per:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
              <li>Adempiere a un obbligo legale</li>
              <li>Proteggere e difendere i diritti o la proprietà di M1SSION</li>
              <li>Prevenire o investigare possibili illeciti in relazione al Servizio</li>
              <li>Proteggere la sicurezza personale degli utenti del Servizio o del pubblico</li>
              <li>Proteggere contro la responsabilità legale</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">6. Sicurezza dei Dati</h2>
            <p className="text-gray-300">
              La sicurezza dei tuoi dati è importante per noi, ma ricorda che nessun metodo di trasmissione su Internet o metodo di archiviazione elettronica è sicuro al 100%. Mentre ci sforziamo di utilizzare mezzi commercialmente accettabili per proteggere i tuoi Dati Personali, non possiamo garantirne la sicurezza assoluta.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">7. I tuoi Diritti</h2>
            <p className="text-gray-300 mb-3">
              M1SSION intende prendere misure ragionevoli per permetterti di correggere, modificare, eliminare o limitare l'utilizzo dei tuoi Dati Personali.
            </p>
            <p className="text-gray-300">
              In determinate circostanze, hai il diritto di:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
              <li>Accedere e ricevere una copia dei tuoi dati personali</li>
              <li>Rettificare i tuoi dati personali che sono inaccurati o incompleti</li>
              <li>Richiedere la cancellazione dei tuoi dati personali</li>
              <li>Opporti al trattamento dei tuoi dati personali</li>
              <li>Richiedere la restrizione del trattamento dei tuoi dati personali</li>
              <li>Ricevere i tuoi dati personali in un formato strutturato, di uso comune e leggibile da dispositivo automatico e di trasmetterli a un altro titolare del trattamento</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">8. Modifiche a questa Informativa sulla Privacy</h2>
            <p className="text-gray-300">
              Potremmo aggiornare la nostra Informativa sulla Privacy di tanto in tanto. Ti informeremo di eventuali modifiche pubblicando la nuova Informativa sulla Privacy in questa pagina. Ti avviseremo via e-mail e/o un avviso di rilievo sul nostro Servizio, prima che la modifica diventi effettiva e aggiorneremo la "data di decorrenza" nella parte superiore di questa Informativa sulla Privacy.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">9. Contattaci</h2>
            <p className="text-gray-300">
              Se hai domande su questa Informativa sulla Privacy, ti preghiamo di contattarci:
            </p>
            <div className="text-gray-300 ml-4 mt-2">
              <p>Email: privacy@m1ssion.com</p>
              <p>Indirizzo: 1077 Budapest, Izabella utca 2. Alagsor 1</p>
            </div>
          </section>
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
