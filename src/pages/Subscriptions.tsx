
import { useState } from "react";
import { Check } from "lucide-react";
import BottomNavigation from "@/components/layout/BottomNavigation";
import SubscriptionCard from "@/components/subscription/SubscriptionCard";

const Subscriptions = () => {
  // Definizione delle caratteristiche per ciascun piano
  const baseFeatures = [
    { text: "4 indizi (1 a settimana)" },
    { text: "Accesso alla community" },
    { text: "Possibilità di vincere" },
  ];

  const silverFeatures = [
    { text: "4 indizi settimanali base" },
    { text: "4 indizi supplementari" },
    { text: "Foto del veicolo" },
    { text: "Supporto prioritario" },
  ];

  const goldFeatures = [
    { text: "Tutti gli indizi Silver" },
    { text: "Geolocalizzazione precisa" },
    { text: "Foto dettagliate del luogo" },
    { text: "Notifiche push in tempo reale" },
  ];

  const blackFeatures = [
    { text: "Tutti gli indizi Gold" },
    { text: "Geolocalizzazione affinata" },
    { text: "Foto dettagliate del luogo" },
    { text: "Notifiche push in tempo reale" },
    { text: "Supporto dedicato 24/7" },
    { text: "Indizi anticipati" },
  ];

  return (
    <div className="pb-20 min-h-screen bg-black">
      {/* Header */}
      <header className="px-4 py-6 flex justify-between items-center border-b border-projectx-deep-blue">
        <h1 className="text-2xl font-bold neon-text">Abbonamenti</h1>
      </header>

      {/* Introduction */}
      <section className="px-4 py-6">
        <h2 className="text-xl font-bold mb-2">Scegli il Tuo Piano</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Sblocca più indizi e aumenta le tue possibilità di vittoria con i nostri pacchetti premium.
        </p>
      </section>

      {/* Subscription Plans */}
      <section className="px-4 pb-8">
        <div className="space-y-8">
          <SubscriptionCard
            title="Base"
            price="Gratuito"
            period=""
            features={baseFeatures}
            ctaText="Piano Attuale"
            type="Base"
          />
          
          <SubscriptionCard
            title="Silver"
            price="€3.99"
            period="settimana"
            features={silverFeatures}
            ctaText="Scegli Piano"
            type="Silver"
          />
          
          <SubscriptionCard
            title="Gold"
            price="€6.99"
            period="settimana"
            features={goldFeatures}
            ctaText="Scegli Piano"
            type="Gold"
            isPopular={true}
          />
          
          <SubscriptionCard
            title="Black"
            price="€9.99"
            period="settimana"
            features={blackFeatures}
            ctaText="Scegli Piano"
            type="Black"
          />
        </div>
      </section>

      {/* Benefits Section */}
      <section className="px-4 py-8 bg-projectx-deep-blue">
        <h2 className="text-xl font-bold mb-6 text-center">Vantaggi dei Piani Premium</h2>
        
        <div className="space-y-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 p-1 rounded-full bg-projectx-neon-blue mr-3">
              <Check className="h-4 w-4 text-black" />
            </div>
            <div>
              <h3 className="font-bold mb-1">Indizi Esclusivi</h3>
              <p className="text-sm text-muted-foreground">
                Accedi a indizi esclusivi che aumentano significativamente le tue possibilità di vittoria.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 p-1 rounded-full bg-projectx-neon-blue mr-3">
              <Check className="h-4 w-4 text-black" />
            </div>
            <div>
              <h3 className="font-bold mb-1">Supporto Prioritario</h3>
              <p className="text-sm text-muted-foreground">
                Ricevi assistenza prioritaria per qualsiasi domanda o problema che potresti incontrare.
              </p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="flex-shrink-0 p-1 rounded-full bg-projectx-neon-blue mr-3">
              <Check className="h-4 w-4 text-black" />
            </div>
            <div>
              <h3 className="font-bold mb-1">Notifiche in Tempo Reale</h3>
              <p className="text-sm text-muted-foreground">
                Ricevi notifiche push in tempo reale quando vengono rilasciati nuovi indizi o aggiornamenti.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="px-4 py-8">
        <h2 className="text-xl font-bold mb-6">Domande Frequenti</h2>
        
        <div className="space-y-4">
          <div className="glass-card">
            <h3 className="font-bold mb-2">Posso cambiare piano in qualsiasi momento?</h3>
            <p className="text-sm text-muted-foreground">
              Sì, puoi aggiornare o declassare il tuo piano in qualsiasi momento. Le modifiche avranno effetto immediatamente.
            </p>
          </div>
          
          <div className="glass-card">
            <h3 className="font-bold mb-2">Come vengono addebitati i piani a pagamento?</h3>
            <p className="text-sm text-muted-foreground">
              I piani a pagamento vengono addebitati settimanalmente sulla tua carta di credito o metodo di pagamento preferito.
            </p>
          </div>
          
          <div className="glass-card">
            <h3 className="font-bold mb-2">Posso annullare il mio abbonamento?</h3>
            <p className="text-sm text-muted-foreground">
              Sì, puoi annullare il tuo abbonamento in qualsiasi momento dalle impostazioni del tuo account. Non ci sono penalità per la cancellazione.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Subscriptions;
