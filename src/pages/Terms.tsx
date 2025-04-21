
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white p-4 pt-20">
      <div className="container mx-auto max-w-4xl">
        <Link to="/">
          <Button variant="outline" className="mb-8">
            <ArrowLeft className="mr-2 w-4 h-4" /> Torna alla Home
          </Button>
        </Link>
        
        <h1 className="text-3xl font-bold mb-6">Termini e Condizioni</h1>
        
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Introduzione</h2>
            <p className="text-gray-300">
              Benvenuto su M1SSION. I seguenti termini e condizioni regolano l'utilizzo della nostra piattaforma e dei servizi correlati. Utilizzando M1SSION, accetti di essere vincolato da questi termini. Se non sei d'accordo con qualsiasi parte di questi termini, ti invitiamo a non utilizzare il nostro servizio.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">2. Definizioni</h2>
            <p className="text-gray-300 mb-3">
              In questi Termini e Condizioni:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
              <li>"M1SSION", "noi", "ci" o "nostro" si riferisce alla piattaforma M1SSION.</li>
              <li>"Utente", "tu" o "tuo" si riferisce a qualsiasi persona che utilizza il nostro servizio.</li>
              <li>"Servizio" si riferisce alla piattaforma M1SSION, inclusi tutti i contenuti, funzionalità e servizi offerti.</li>
              <li>"Concorso" si riferisce a qualsiasi competizione, sorteggio o promozione organizzata tramite il nostro Servizio.</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">3. Requisiti di Idoneità</h2>
            <p className="text-gray-300 mb-3">
              Per utilizzare M1SSION devi:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
              <li>Avere almeno 18 anni di età o l'età di maggioranza legale nella tua giurisdizione, se superiore.</li>
              <li>Fornire informazioni accurate, aggiornate e complete durante il processo di registrazione.</li>
              <li>Mantenere la riservatezza delle tue credenziali di accesso.</li>
              <li>Essere responsabile di tutte le attività che si verificano sotto il tuo account.</li>
              <li>Non creare più di un account per persona.</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">4. Utilizzo del Servizio</h2>
            <p className="text-gray-300 mb-3">
              Utilizzando M1SSION, accetti di:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
              <li>Utilizzare il Servizio solo per scopi legali e conformi a questi Termini.</li>
              <li>Non utilizzare il Servizio per attività illegali, fraudolente o non autorizzate.</li>
              <li>Non tentare di accedere a aree o informazioni a cui non sei autorizzato.</li>
              <li>Non interferire con il funzionamento del Servizio o dei server e reti connessi.</li>
              <li>Non raccogliere o immagazzinare dati personali di altri utenti senza il loro consenso.</li>
              <li>Non violare i diritti di proprietà intellettuale di M1SSION o di terze parti.</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">5. Concorsi e Premi</h2>
            <p className="text-gray-300 mb-3">
              Riguardo ai concorsi organizzati tramite M1SSION:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
              <li>Tutti i concorsi sono soggetti alle regole specifiche pubblicate per ciascun concorso.</li>
              <li>I premi saranno assegnati come descritto nelle regole del concorso specifico.</li>
              <li>Ci riserviamo il diritto di modificare, sospendere o annullare qualsiasi concorso a nostra esclusiva discrezione.</li>
              <li>I vincitori sono responsabili per qualsiasi tassa, imposta o costo associato alla ricezione e/o utilizzo dei premi.</li>
              <li>Le decisioni finali riguardanti i vincitori sono a nostra esclusiva discrezione e sono definitive.</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">6. Abbonamenti e Pagamenti</h2>
            <p className="text-gray-300 mb-3">
              Per quanto riguarda gli abbonamenti e i pagamenti:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
              <li>Alcuni aspetti del Servizio potrebbero richiedere un pagamento o un abbonamento.</li>
              <li>I prezzi degli abbonamenti e dei servizi a pagamento sono indicati sul Servizio.</li>
              <li>I pagamenti vengono elaborati tramite i fornitori di servizi di pagamento terzi.</li>
              <li>Non archiviamo direttamente i dati delle carte di credito.</li>
              <li>Gli abbonamenti si rinnovano automaticamente fino a quando non vengono annullati.</li>
              <li>Le politiche di rimborso sono specificate nelle regole di ciascun servizio o abbonamento.</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">7. Proprietà Intellettuale</h2>
            <p className="text-gray-300 mb-3">
              Riguardo alla proprietà intellettuale:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
              <li>Tutti i contenuti, le caratteristiche e le funzionalità del Servizio sono di proprietà di M1SSION o dei suoi licenzianti e sono protetti dalle leggi sulla proprietà intellettuale.</li>
              <li>Non puoi copiare, modificare, distribuire, vendere o affittare qualsiasi parte del Servizio senza il nostro consenso scritto.</li>
              <li>I loghi, i nomi e i marchi di M1SSION sono di nostra proprietà e non possono essere utilizzati senza il nostro consenso scritto.</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">8. Limitazione di Responsabilità</h2>
            <p className="text-gray-300 mb-3">
              In merito alla limitazione di responsabilità:
            </p>
            <ul className="list-disc list-inside text-gray-300 space-y-1 ml-4">
              <li>Il Servizio è fornito "così com'è" e "come disponibile", senza garanzie di alcun tipo.</li>
              <li>Non garantiamo che il Servizio sarà ininterrotto, tempestivo, sicuro o privo di errori.</li>
              <li>Non saremo responsabili per eventuali perdite o danni derivanti dall'utilizzo o dall'incapacità di utilizzare il Servizio.</li>
              <li>La nostra responsabilità massima per qualsiasi reclamo è limitata all'importo pagato dall'utente per il Servizio nei 12 mesi precedenti.</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">9. Modifiche ai Termini</h2>
            <p className="text-gray-300">
              Ci riserviamo il diritto di modificare questi Termini in qualsiasi momento. Le modifiche entreranno in vigore immediatamente dopo la pubblicazione sul Servizio. L'uso continuato del Servizio dopo tali modifiche costituisce l'accettazione dei nuovi Termini.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">10. Legge Applicabile</h2>
            <p className="text-gray-300">
              Questi Termini saranno regolati e interpretati in conformità con le leggi italiane, senza riguardo ai suoi principi di conflitto di leggi.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">11. Contatti</h2>
            <p className="text-gray-300">
              Per qualsiasi domanda riguardo questi Termini, contattaci all'indirizzo legale@m1ssion.com o tramite la sezione Contatti del nostro sito.
            </p>
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

export default Terms;
