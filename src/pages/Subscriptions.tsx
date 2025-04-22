
import { useState, useEffect } from "react";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import { Check } from "lucide-react";
import SubscriptionCard from "@/components/subscription/SubscriptionCard";

const Subscriptions = () => {
  const [selected, setSelected] = useState<string>("Base");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  useEffect(() => {
    setProfileImage(localStorage.getItem('profileImage'));
    
    // Carica l'abbonamento corrente
    const currentPlan = localStorage.getItem('subscription_plan');
    if (currentPlan) {
      setSelected(currentPlan);
    }
    
    // Ascolta cambiamenti nell'abbonamento
    const handleStorageChange = () => {
      const updatedPlan = localStorage.getItem('subscription_plan');
      if (updatedPlan) {
        setSelected(updatedPlan);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

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
    <div className="min-h-screen bg-black w-full">
      <UnifiedHeader profileImage={profileImage} />
      <div className="h-[72px] w-full" />
      <div className="max-w-screen-xl mx-auto">
        {/* Introduction */}
        <section className="w-full py-8">
          <h2 className="text-2xl font-bold mb-3 px-4 text-center bg-gradient-to-r from-[#4361ee] to-[#7209b7] bg-clip-text text-transparent">Scegli il Tuo Piano</h2>
          <p className="text-base text-white/70 mb-8 px-4 text-center max-w-2xl mx-auto">
            Sblocca più indizi e aumenta le tue possibilità di vittoria con i nostri pacchetti premium.
          </p>
        </section>

        {/* Subscription Plans */}
        <section className="w-full px-4 pb-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
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
        <section className="w-full py-10 px-4 backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl mx-auto max-w-3xl mb-12">
          <h2 className="text-2xl font-bold mb-8 text-center bg-gradient-to-r from-[#4361ee] to-[#7209b7] bg-clip-text text-transparent">Vantaggi dei Piani Premium</h2>
          <div className="space-y-4 max-w-xl mx-auto">
            <div className="flex items-center p-3 bg-white/5 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#4361ee] to-[#7209b7] flex items-center justify-center mr-4 flex-shrink-0">
                <Check className="w-5 h-5 text-white" />
              </div>
              <span className="text-white/90">Più indizi per aumentare le possibilità di vittoria</span>
            </div>
            <div className="flex items-center p-3 bg-white/5 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#4361ee] to-[#7209b7] flex items-center justify-center mr-4 flex-shrink-0">
                <Check className="w-5 h-5 text-white" />
              </div>
              <span className="text-white/90">Accesso anticipato a nuovi eventi e premi esclusivi</span>
            </div>
            <div className="flex items-center p-3 bg-white/5 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#4361ee] to-[#7209b7] flex items-center justify-center mr-4 flex-shrink-0">
                <Check className="w-5 h-5 text-white" />
              </div>
              <span className="text-white/90">Badge speciale nel profilo utente</span>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full py-10 px-4 mb-12">
          <h2 className="text-2xl font-bold mb-8 text-center bg-gradient-to-r from-[#4361ee] to-[#7209b7] bg-clip-text text-transparent">Domande Frequenti</h2>
          <div className="space-y-4 max-w-3xl mx-auto">
            <div className="glass-card">
              <h3 className="font-semibold text-lg mb-2">Cosa succede dopo aver acquistato un abbonamento?</h3>
              <p className="text-white/70">
                Subito dopo l'acquisto avrai accesso ai vantaggi del piano selezionato.
              </p>
            </div>
            <div className="glass-card">
              <h3 className="font-semibold text-lg mb-2">Posso cambiare piano in qualsiasi momento?</h3>
              <p className="text-white/70">
                Sì, puoi cambiare o annullare il tuo abbonamento in qualsiasi momento dalle impostazioni del profilo.
              </p>
            </div>
            <div className="glass-card">
              <h3 className="font-semibold text-lg mb-2">Come vengono gestiti i pagamenti?</h3>
              <p className="text-white/70">
                I pagamenti sono gestiti in totale sicurezza tramite Stripe.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Subscriptions;
