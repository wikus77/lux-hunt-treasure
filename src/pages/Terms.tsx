
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const Terms = () => {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white p-4 pt-20">
      <div className="container mx-auto max-w-3xl mb-16">
        <div className="mb-8">
          <Link to="/">
            <Button variant="outline" className="mb-8">
              <ArrowLeft className="mr-2 w-4 h-4" /> Torna alla Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-6">Termini e Condizioni</h1>
          <p className="text-gray-400 mb-8">
            Ultimo aggiornamento: 21 Aprile 2025
          </p>
        </div>

        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Accettazione dei Termini</h2>
            <p className="text-gray-300">
              Utilizzando il sito web di M1SSION, l'app mobile o qualsiasi servizio offerto da M1SSION (collettivamente, i "Servizi"), accetti di essere vincolato da questi Termini e Condizioni ("Termini"). Se non accetti questi Termini, ti preghiamo di non utilizzare i nostri Servizi.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Requisiti di Età</h2>
            <p className="text-gray-300">
              I Servizi di M1SSION sono disponibili solo per gli utenti che hanno almeno 18 anni. Utilizzando i nostri Servizi, confermi di avere almeno 18 anni e di avere la capacità legale di accettare questi Termini.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Registrazione dell'Account</h2>
            <p className="text-gray-300">
              Per utilizzare alcune funzionalità dei nostri Servizi, potresti dover creare un account. Sei responsabile di mantenere la riservatezza delle tue credenziali di accesso e di tutte le attività che si verificano sotto il tuo account. Ci riserviamo il diritto di chiudere account che violano questi Termini o che sono inattivi per un periodo prolungato.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Eventi e Premi</h2>
            <p className="text-gray-300 mb-3">
              M1SSION organizza eventi e offre premi soggetti a specifiche regole e condizioni:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-300 ml-4">
              <li>Tutti gli eventi sono soggetti a regole specifiche pubblicate separatamente</li>
              <li>I premi sono descritti nei dettagli dell'evento e possono essere soggetti a disponibilità</li>
              <li>Ci riserviamo il diritto di modificare, sostituire o annullare premi in circostanze eccezionali</li>
              <li>I vincitori dei premi potrebbero essere responsabili per eventuali tasse o imposte applicabili</li>
              <li>La partecipazione agli eventi potrebbe richiedere abbonamenti specifici</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Abbonamenti e Pagamenti</h2>
            <p className="text-gray-300">
              Alcuni Servizi di M1SSION richiedono l'acquisto di abbonamenti. I dettagli relativi ai prezzi, alla durata e ai vantaggi degli abbonamenti sono disponibili sulla piattaforma. I pagamenti sono processati tramite fornitori di servizi di pagamento di terze parti e sono soggetti alle loro condizioni. Gli abbonamenti si rinnovano automaticamente, a meno che non vengano annullati prima della data di rinnovo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Proprietà Intellettuale</h2>
            <p className="text-gray-300">
              Tutti i diritti di proprietà intellettuale relativi ai Servizi di M1SSION, inclusi ma non limitati a copyright, marchi, design, loghi, contenuti, software e codice, sono di proprietà di M1SSION o dei suoi licenziatari. Non è consentito utilizzare, copiare, riprodurre, modificare, pubblicare, caricare, pubblicare, trasmettere, distribuire o creare opere derivate da tali contenuti senza il nostro consenso scritto.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Limitazione di Responsabilità</h2>
            <p className="text-gray-300">
              Nella misura massima consentita dalla legge applicabile, M1SSION non sarà responsabile per danni diretti, indiretti, incidentali, consequenziali, speciali o punitivi derivanti dall'utilizzo o dall'impossibilità di utilizzare i nostri Servizi, anche se avvisata della possibilità di tali danni.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Modifiche ai Termini</h2>
            <p className="text-gray-300">
              Ci riserviamo il diritto di modificare questi Termini in qualsiasi momento. Le modifiche entreranno in vigore immediatamente dopo la pubblicazione dei Termini aggiornati sul nostro sito web. L'uso continuato dei nostri Servizi dopo tali modifiche costituisce l'accettazione dei nuovi Termini.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Legge Applicabile</h2>
            <p className="text-gray-300">
              Questi Termini saranno regolati e interpretati in conformità con le leggi italiane, senza riguardo ai conflitti di principi legali.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Contattaci</h2>
            <p className="text-gray-300">
              Se hai domande o dubbi riguardo a questi Termini, contattaci all'indirizzo: info@m1ssion.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
