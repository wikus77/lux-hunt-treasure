
import { useState } from "react";
import { Check } from "lucide-react";
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
      {/* Introduction */}
      <section className="w-full py-6">
        <h2 className="text-xl font-bold mb-2 px-4 text-center">Scegli il Tuo Piano</h2>
        <p className="text-sm text-muted-foreground mb-6 px-4 text-center">
          Sblocca più indizi e aumenta le tue possibilità di vittoria con i nostri pacchetti premium.
        </p>
      </section>

      {/* Subscription Plans */}
      <section className="w-full px-4 pb-8">
        <div className="space-y-4">
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
            price="€3,99"
            period="mese"
            features={getSubscriptionFeatures("Silver")}
            isPopular={false}
            ctaText={selected === "Silver" ? "Piano Attuale" : "Passa a Silver"}
            type="Silver"
          />
          <SubscriptionCard
            title="Gold"
            price="€6,99"
            period="mese"
            features={getSubscriptionFeatures("Gold")}
            isPopular={true}
            ctaText={selected === "Gold" ? "Piano Attuale" : "Passa a Gold"}
            type="Gold"
          />
          <SubscriptionCard
            title="Black"
            price="€9,99"
            period="mese"
            features={getSubscriptionFeatures("Black")}
            isPopular={false}
            ctaText={selected === "Black" ? "Piano Attuale" : "Passa a Black"}
            type="Black"
          />
        </div>
      </section>

      {/* Benefits Section */}
      <section className="w-full py-8 px-4 bg-gradient-to-r from-[#4361ee]/10 to-[#7209b7]/10 border-y border-[#4361ee]/20 rounded-lg mx-auto max-w-3xl">
        <h2 className="text-xl font-bold mb-6 text-center bg-gradient-to-r from-[#4361ee] to-[#7209b7] bg-clip-text text-transparent">Vantaggi dei Piani Premium</h2>
        <div className="space-y-4">
          <div className="flex items-center">
            <Check className="mr-2 text-[#4361ee]" />
            <span>Più indizi per aumentare le possibilità di vittoria</span>
          </div>
          <div className="flex items-center">
            <Check className="mr-2 text-[#7209b7]" />
            <span>Accesso anticipato a nuovi eventi e premi esclusivi</span>
          </div>
          <div className="flex items-center">
            <Check className="mr-2 text-[#4361ee]" />
            <span>Badge speciale nel profilo utente</span>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="w-full py-8">
        <h2 className="text-xl font-bold mb-6 px-4 text-center">Domande Frequenti</h2>
        <div className="space-y-4 px-4">
          <div className="glass-card p-4">
            <h3 className="font-semibold">Cosa succede dopo aver acquistato un abbonamento?</h3>
            <p className="text-muted-foreground">
              Subito dopo l'acquisto avrai accesso ai vantaggi del piano selezionato.
            </p>
          </div>
          <div className="glass-card p-4">
            <h3 className="font-semibold">Posso cambiare piano in qualsiasi momento?</h3>
            <p className="text-muted-foreground">
              Sì, puoi cambiare o annullare il tuo abbonamento in qualsiasi momento dalle impostazioni del profilo.
            </p>
          </div>
          <div className="glass-card p-4">
            <h3 className="font-semibold">Come vengono gestiti i pagamenti?</h3>
            <p className="text-muted-foreground">
              I pagamenti sono gestiti in totale sicurezza tramite Stripe.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Subscriptions;
