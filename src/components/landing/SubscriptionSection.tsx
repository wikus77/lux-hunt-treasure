import { motion } from 'framer-motion';
import { Check, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubscriptionSectionProps {
  countdownCompleted?: boolean;
}

const SubscriptionSection = ({ countdownCompleted = false }: SubscriptionSectionProps) => {
  const subscriptions = [
    {
      title: 'Base – Gratis',
      price: '€0',
      period: '/mese',
      highlight: false,
      features: [
        "Funzioni base (accesso alla missione con restrizioni)",
        "Supporto email standard",
        "1 indizio settimanale base"
      ],
      notIncluded: [
        "Nessun accesso anticipato agli eventi",
        "Nessun badge esclusivo"
      ],
      buttonText: 'Inizia Gratis',
      buttonColor: 'bg-gradient-to-r from-[#00E5FF] to-[#008eb3] text-black hover:shadow-[0_0_15px_rgba(0,229,255,0.5)]'
    },
    {
      title: 'Silver',
      price: '€3.99',
      period: '/mese',
      features: [
        "Tutti i vantaggi Base",
        "3 indizi premium aggiuntivi a settimana",
        "Accesso anticipato di 2 ore agli eventi",
        "Badge Silver nel profilo"
      ],
      buttonText: 'Scegli Silver',
      buttonColor: 'bg-gradient-to-r from-[#C0C0C0] to-[#919191] text-black hover:shadow-[0_0_15px_rgba(192,192,192,0.5)]'
    },
    {
      title: 'Gold',
      price: '€6.99',
      period: '/mese',
      highlight: true,
      features: [
        "Tutti i vantaggi Silver",
        "4 indizi premium aggiuntivi a settimana",
        "Accesso anticipato di 12 ore agli eventi",
        "Partecipazione alle estrazioni Gold",
        "Badge Gold esclusivo nel profilo"
      ],
      buttonText: 'Scegli Gold',
      buttonColor: 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black hover:shadow-[0_0_15px_rgba(255,215,0,0.5)]'
    },
    {
      title: 'Black',
      price: '€9.99',
      period: '/mese',
      features: [
        "Tutti i vantaggi Gold",
        "Accesso VIP anticipato di 24 ore agli eventi",
        "5 indizi premium aggiuntivi a settimana",
        "Badge Black esclusivo"
      ],
      buttonText: 'Scegli Black',
      buttonColor: 'bg-gradient-to-r from-[#1A1A1A] to-[#333333] text-white hover:shadow-[0_0_15px_rgba(0,0,0,0.7)]'
    },
    {
      title: 'Titanium',
      price: '€29.99',
      period: '/mese',
      features: [
        "Tutti i vantaggi Black",
        "7 indizi premium aggiuntivi a settimana",
        "Accesso VIP anticipato di 48 ore agli eventi",
        "Supporto prioritario dedicato (24/7)",
        "Eventi esclusivi M1SSION™",
        "Badge Titanium esclusivo"
      ],
      buttonText: 'Scegli Titanium',
      buttonColor: 'bg-gradient-to-r from-[#8A2BE2] to-[#4B0082] text-white hover:shadow-[0_0_15px_rgba(138,43,226,0.5)]'
    }
  ];

  return (
    <section className="py-16 px-4 bg-black relative" data-parallax="scroll" data-image-src="/images/grid-pattern.png">
      <div className="absolute inset-0 bg-[url('/public/images/grid-pattern.png')] opacity-10"></div>
      
      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold inline-block">
            <span className="text-[#00E5FF]">M1</span><span className="text-white">SSION</span> Abbonamenti
          </h2>
          <p className="mt-4 text-white/70 max-w-2xl mx-auto">
            Scegli il piano più adatto a te e inizia la tua avventura. Tutti i piani offrono la possibilità di vincere premi reali.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-12 max-w-7xl mx-auto">{/* Tutti i piani orizzontali */}
          {subscriptions.map((sub, index) => (
            <motion.div
              key={index}
              className={`rounded-xl relative p-4 w-full ${sub.highlight ? 'bg-gradient-to-b from-[#00E5FF]/20 to-black/70 border border-[#00E5FF]/30' : 'bg-white/5 border border-white/10'}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              {/* Badge per il piano consigliato */}
              {sub.highlight && (
                <div className="absolute -top-3 -right-3 bg-[#00E5FF] text-black text-xs font-bold py-1 px-3 rounded-full flex items-center">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Consigliato
                </div>
              )}
              
              <div className="mb-4">
                <h3 className="text-lg font-bold text-white">{sub.title}</h3>
                <div className="mt-2">
                  <span className="text-xl font-bold text-white">{sub.price}</span>
                  {sub.period && <span className="text-white/50 text-xs">{sub.period}</span>}
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                {sub.features.slice(0, 3).map((feature, idx) => (
                  <div key={idx} className="flex items-center">
                    <Check className="h-4 w-4 text-green-400 mr-2 flex-shrink-0" />
                    <span className="text-white/80 text-xs">{feature}</span>
                  </div>
                ))}
                
                {sub.notIncluded?.slice(0, 2).map((feature, idx) => (
                  <div key={idx} className="flex items-center text-white/40">
                    <X className="h-4 w-4 mr-2 flex-shrink-0" />
                    <span className="text-xs">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                className={`w-full text-xs py-2 ${sub.buttonColor} ${!countdownCompleted ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={!countdownCompleted}
              >
                {sub.buttonText}
              </Button>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          className="text-center text-white/50 text-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          viewport={{ once: true }}
        >
          Tutti gli abbonamenti sono soggetti ai nostri Termini e Condizioni. Puoi cancellare in qualsiasi momento.
        </motion.div>
      </div>
    </section>
  );
};

export default SubscriptionSection;
