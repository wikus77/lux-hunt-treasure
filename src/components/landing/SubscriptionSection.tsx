import { motion } from 'framer-motion';
import { Check, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SubscriptionSectionProps {
  countdownCompleted?: boolean;
}

const SubscriptionSection = ({ countdownCompleted = false }: SubscriptionSectionProps) => {
  const subscriptions = [
    {
      title: 'Base',
      price: 'Gratuito',
      highlight: false,
      features: [
        "Accesso all'app base",
        "1 indizio a settimana",
        "Partecipazione alle missioni base",
        "Supporto via email",
      ],
      notIncluded: [
        "Indizi premium",
        "Tracciamento avanzato",
        "Accesso anticipato",
        "Supporto prioritario"
      ],
      buttonText: 'Inizia Gratis',
      buttonColor: 'bg-gradient-to-r from-[#00E5FF] to-[#008eb3] text-black hover:shadow-[0_0_15px_rgba(0,229,255,0.5)]'
    },
    {
      title: 'Silver',
      price: '€6.99',
      period: '/mese',
      features: [
        "Tutto del piano Base",
        "3 indizi a settimana",
        "Tracciamento base",
        "Supporto chat",
      ],
      notIncluded: [
        "Accesso anticipato",
        "Supporto prioritario"
      ],
      buttonText: 'Scegli Silver',
      buttonColor: 'bg-gradient-to-r from-[#C0C0C0] to-[#919191] text-black hover:shadow-[0_0_15px_rgba(192,192,192,0.5)]'
    },
    {
      title: 'Gold',
      price: '€9.99',
      period: '/mese',
      highlight: true,
      features: [
        "Tutto del piano Silver",
        "5 indizi a settimana",
        "Tracciamento avanzato",
        "Accesso anticipato (24h)",
        "Supporto prioritario",
      ],
      buttonText: 'Scegli Gold',
      buttonColor: 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black hover:shadow-[0_0_15px_rgba(255,215,0,0.5)]'
    },
    {
      title: 'Black',
      price: '€13.99',
      period: '/mese',
      features: [
        "Tutto del piano Gold",
        "7 indizi a settimana",
        "Contenuti esclusivi",
        "Accesso anticipato (48h)",
        "Supporto VIP",
      ],
      buttonText: 'Scegli Black',
      buttonColor: 'bg-gradient-to-r from-[#1A1A1A] to-[#333333] text-white hover:shadow-[0_0_15px_rgba(0,0,0,0.7)]'
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
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {subscriptions.map((sub, index) => (
            <motion.div
              key={index}
              className={`rounded-xl relative p-6 ${sub.highlight ? 'bg-gradient-to-b from-[#00E5FF]/20 to-black/70 border border-[#00E5FF]/30' : 'bg-white/5 border border-white/10'}`}
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
              
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white">{sub.title}</h3>
                <div className="mt-2">
                  <span className="text-2xl font-bold text-white">{sub.price}</span>
                  {sub.period && <span className="text-white/50 text-sm">{sub.period}</span>}
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                {sub.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center">
                    <Check className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" />
                    <span className="text-white/80 text-sm">{feature}</span>
                  </div>
                ))}
                
                {sub.notIncluded?.map((feature, idx) => (
                  <div key={idx} className="flex items-center text-white/40">
                    <X className="h-5 w-5 mr-2 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                className={`w-full ${sub.buttonColor} ${!countdownCompleted ? 'opacity-70 cursor-not-allowed' : ''}`}
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
