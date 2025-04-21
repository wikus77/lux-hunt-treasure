
import { useState } from "react";
import { Check } from "lucide-react";
import BottomNavigation from "@/components/layout/BottomNavigation";
import SubscriptionCard from "@/components/subscription/SubscriptionCard";

const Subscriptions = () => {
  const [selected, setSelected] = useState<string>("Base");

  const getSubscriptionFeatures = (type: string) => {
    switch (type) {
      case "Base":
        return [
          { text: "Accesso gratuito agli eventi mensili" },
          { text: "1 indizio incluso a settimana" },
          { text: "Partecipazione alle estrazioni base" }
        ];
      case "Silver":
        return [
          { text: "Tutti i vantaggi Base" },
          { text: "3 indizi premium aggiuntivi a settimana" },
          { text: "Accesso anticipato ai nuovi eventi" },
          { text: "Badge Silver nel profilo" }
        ];
      case "Gold":
        return [
          { text: "Tutti i vantaggi Silver" },
          { text: "Indizi illimitati durante l'evento" },
          { text: "Partecipazione alle estrazioni Gold" },
          { text: "Badge Gold nel profilo" }
        ];
      case "Black":
        return [
          { text: "Tutti i vantaggi Gold" },
          { text: "Accesso VIP ad eventi esclusivi" },
          { text: "Premi misteriosi aggiuntivi" },
          { text: "Badge Black nel profilo" }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="pb-20 min-h-screen bg-black w-full">
      <header className="fixed top-0 left-0 right-0 z-40 w-full px-4 py-6 flex items-center border-b border-projectx-deep-blue glass-backdrop transition-colors duration-300">
        <h1 className="text-2xl font-bold neon-text flex-1 text-center">Abbonamenti</h1>
      </header>
      <div className="h-[72px] w-full" />

      {/* Introduction */}
      <section className="w-full py-6">
        <h2 className="text-xl font-bold mb-2 px-4">Scegli il Tuo Piano</h2>
        <p className="text-sm text-muted-foreground mb-6 px-4">
          Sblocca più indizi e aumenta le tue possibilità di vittoria con i nostri pacchetti premium.
        </p>
      </section>

      {/* Subscription Plans */}
      <section className="w-full pb-8">
        <div className="space-y-8">
          <SubscriptionCard
            title="Base"
            price="Gratis"
            period="mese"
            features={getSubscriptionFeatures("Base")}
            isPopular={false}
            ctaText="Piano Attuale"
            type="Base"
          />
          <SubscriptionCard
            title="Silver"
            price="€9,99"
            period="mese"
            features={getSubscriptionFeatures("Silver")}
            isPopular={false}
            ctaText={selected === "Silver" ? "Piano Attuale" : "Passa a Silver"}
            type="Silver"
          />
          <SubscriptionCard
            title="Gold"
            price="€19,99"
            period="mese"
            features={getSubscriptionFeatures("Gold")}
            isPopular={true}
            ctaText={selected === "Gold" ? "Piano Attuale" : "Passa a Gold"}
            type="Gold"
          />
          <SubscriptionCard
            title="Black"
            price="€49,99"
            period="mese"
            features={getSubscriptionFeatures("Black")}
            isPopular={false}
            ctaText={selected === "Black" ? "Piano Attuale" : "Passa a Black"}
            type="Black"
          />
        </div>
      </section>

      {/* Benefits Section */}
      <section className="w-full py-8 bg-projectx-deep-blue">
        <h2 className="text-xl font-bold mb-6 text-center">Vantaggi dei Piani Premium</h2>
        <div className="space-y-4 px-4">
          <div className="flex items-center">
            <Check className="mr-2 text-projectx-neon-blue" />
            <span>Più indizi per aumentare le possibilità di vittoria</span>
          </div>
          <div className="flex items-center">
            <Check className="mr-2 text-projectx-neon-blue" />
            <span>Accesso anticipato a nuovi eventi e premi esclusivi</span>
          </div>
          <div className="flex items-center">
            <Check className="mr-2 text-projectx-neon-blue" />
            <span>Badge speciale nel profilo utente</span>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full py-8">
        <h2 className="text-xl font-bold mb-6 px-4">Domande Frequenti</h2>
        <div className="space-y-4 px-4">
          <div>
            <h3 className="font-semibold">Cosa succede dopo aver acquistato un abbonamento?</h3>
            <p className="text-muted-foreground">
              Subito dopo l'acquisto avrai accesso ai vantaggi del piano selezionato.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Posso cambiare piano in qualsiasi momento?</h3>
            <p className="text-muted-foreground">
              Sì, puoi cambiare o annullare il tuo abbonamento in qualsiasi momento dalle impostazioni del profilo.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Come vengono gestiti i pagamenti?</h3>
            <p className="text-muted-foreground">
              I pagamenti sono gestiti in totale sicurezza tramite Stripe.
            </p>
          </div>
        </div>
      </section>

      <BottomNavigation />
    </div>
  );
};

export default Subscriptions;
