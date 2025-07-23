// M1SSION™ - How It Works Page for iOS Capacitor
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Play, 
  MapPin, 
  Target, 
  Trophy, 
  Zap, 
  Users, 
  Star,
  CheckCircle,
  ArrowRight,
  Smartphone,
  Search,
  Gift
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEnhancedNavigation } from '@/hooks/useEnhancedNavigation';
import { preserveFunctionName } from '@/utils/iosCapacitorFunctions';
import { useCapacitorHardware } from '@/hooks/useCapacitorHardware';

interface HowItWorksStep {
  id: number;
  title: string;
  description: string;
  icon: any;
  details: string[];
  color: string;
}

const steps: HowItWorksStep[] = [
  {
    id: 1,
    title: 'Registrati come Agente',
    description: 'Crea il tuo profilo agente e ricevi il tuo codice identificativo unico',
    icon: Users,
    details: [
      'Ricevi il tuo Agent Code personale',
      'Ottieni 100 crediti gratuiti',
      'Accedi alla console agente',
      'Entra nella community M1SSION™'
    ],
    color: 'text-[#00D1FF]'
  },
  {
    id: 2,
    title: 'Usa BUZZ per Esplorare',
    description: 'Attiva BUZZ sulla mappa per sbloccare aree e trovare indizi nascosti',
    icon: Zap,
    details: [
      'Clicca BUZZ in qualsiasi punto della mappa',
      'Sblocca aree circolari di varie dimensioni',
      'Trova indizi specifici per ogni settimana',
      'Costi dinamici basati sull\'utilizzo giornaliero'
    ],
    color: 'text-[#F059FF]'
  },
  {
    id: 3,
    title: 'Raccogli Indizi',
    description: 'Accumula indizi per triangolare la posizione esatta dei premi',
    icon: Search,
    details: [
      'Indizi Vaghi: informazioni generali (10 crediti)',
      'Indizi Medi: dettagli più specifici (30 crediti)',
      'Indizi Precisi: coordinate esatte (50 crediti)',
      'Combina indizi per massima precisione'
    ],
    color: 'text-green-400'
  },
  {
    id: 4,
    title: 'Vinci Premi Reali',
    description: 'Trova i premi fisici nella vita reale e richiedi la tua ricompensa',
    icon: Trophy,
    details: [
      'Auto di lusso e supercar',
      'Gioielli e orologi di prestigio',
      'Esperienze VIP esclusive',
      'Premi in denaro contante',
      'Viaggi e soggiorni di lusso'
    ],
    color: 'text-yellow-400'
  }
];

export const HowItWorksPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(1);
  const { navigateWithFeedback } = useEnhancedNavigation();
  const { vibrate } = useCapacitorHardware();

  // Handle step selection
  const handleStepSelect = preserveFunctionName(async (stepId: number) => {
    await vibrate(30);
    setActiveStep(stepId);
  }, 'handleStepSelect');

  // Handle start mission
  const handleStartMission = preserveFunctionName(async () => {
    await vibrate(50);
    navigateWithFeedback('/register');
  }, 'handleStartMission');

  return (
    <div className="min-h-screen p-4 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-[#00D1FF] to-[#F059FF] rounded-full flex items-center justify-center">
            <Play className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Come Funziona</h1>
        </div>
        
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
          M1SSION™ è il primo treasure hunt digitale al mondo.
          Esplora il mondo reale per trovare premi di lusso nascosti.
        </p>

        <div className="flex justify-center gap-4 mt-6">
          <Badge className="bg-[#00D1FF] text-black">
            <Target className="w-4 h-4 mr-1" />
            Premi Reali
          </Badge>
          <Badge className="bg-[#F059FF] text-white">
            <MapPin className="w-4 h-4 mr-1" />
            Mondo Reale
          </Badge>
          <Badge className="bg-green-500 text-black">
            <Gift className="w-4 h-4 mr-1" />
            Gratis da Giocare
          </Badge>
        </div>
      </motion.div>

      {/* Video Placeholder */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="relative"
      >
        <Card className="glass-card overflow-hidden">
          <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 bg-[#00D1FF]/20 rounded-full flex items-center justify-center mx-auto">
                <Play className="w-10 h-10 text-[#00D1FF]" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Video Introduttivo
                </h3>
                <p className="text-gray-400">
                  Scopri come funziona M1SSION™ in 2 minuti
                </p>
              </div>
              <Button className="bg-[#00D1FF] text-black hover:bg-[#00B8E6]">
                <Play className="w-4 h-4 mr-2" />
                Guarda Video
              </Button>
            </div>
            
            {/* Overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        </Card>
      </motion.div>

      {/* Steps Navigation */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex justify-center"
      >
        <div className="flex bg-gray-800/50 rounded-full p-1 gap-1">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => handleStepSelect(step.id)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300
                ${activeStep === step.id 
                  ? 'bg-[#00D1FF] text-black font-semibold' 
                  : 'text-gray-400 hover:text-white'
                }
              `}
            >
              <step.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{step.title}</span>
              <span className="sm:hidden">{step.id}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Active Step Content */}
      <motion.div
        key={activeStep}
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        {steps.map((step) => {
          if (step.id !== activeStep) return null;
          
          const StepIcon = step.icon;
          
          return (
            <Card key={step.id} className="glass-card">
              <CardContent className="p-6 space-y-6">
                {/* Step Header */}
                <div className="text-center space-y-4">
                  <div className={`w-16 h-16 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center mx-auto ring-2 ring-gray-600`}>
                    <StepIcon className={`w-8 h-8 ${step.color}`} />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        Passo {step.id}
                      </Badge>
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      {step.title}
                    </h2>
                    <p className="text-gray-400 mt-2 max-w-2xl mx-auto">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Step Details */}
                <div className="grid gap-3 max-w-2xl mx-auto">
                  {step.details.map((detail, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-gray-800/30 rounded-lg"
                    >
                      <CheckCircle className={`w-5 h-5 ${step.color} flex-shrink-0`} />
                      <span className="text-gray-300">{detail}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Navigation */}
                <div className="flex justify-center gap-3 pt-4">
                  {activeStep > 1 && (
                    <Button
                      variant="outline"
                      onClick={() => handleStepSelect(activeStep - 1)}
                    >
                      Precedente
                    </Button>
                  )}
                  
                  {activeStep < steps.length ? (
                    <Button
                      onClick={() => handleStepSelect(activeStep + 1)}
                      className="bg-[#00D1FF] text-black hover:bg-[#00B8E6]"
                    >
                      Successivo
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleStartMission}
                      className="bg-gradient-to-r from-[#00D1FF] to-[#F059FF] text-white font-bold px-8"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Inizia la Missione
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <Smartphone className="w-12 h-12 mx-auto mb-4 text-[#00D1FF]" />
            <h3 className="font-bold text-white mb-2">App Mobile</h3>
            <p className="text-gray-400 text-sm">
              Gioca ovunque con la nostra app ottimizzata per iOS e Android
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <MapPin className="w-12 h-12 mx-auto mb-4 text-[#F059FF]" />
            <h3 className="font-bold text-white mb-2">Mondo Reale</h3>
            <p className="text-gray-400 text-sm">
              I premi sono nascosti in location fisiche che devi visitare
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card">
          <CardContent className="p-6 text-center">
            <Users className="w-12 h-12 mx-auto mb-4 text-green-400" />
            <h3 className="font-bold text-white mb-2">Community</h3>
            <p className="text-gray-400 text-sm">
              Unisciti a migliaia di agenti in tutto il mondo
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* FAQ Quick */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="glass-card">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              Domande Frequenti
            </h3>
            
            <div className="space-y-4">
              <div className="p-4 bg-gray-800/30 rounded-lg">
                <h4 className="font-semibold text-white mb-2">
                  È davvero gratis giocare?
                </h4>
                <p className="text-gray-400 text-sm">
                  Sì! Ricevi 100 crediti gratuiti alla registrazione. 
                  BUZZ costa €1.99-€9.99 al giorno in base all'utilizzo.
                </p>
              </div>
              
              <div className="p-4 bg-gray-800/30 rounded-lg">
                <h4 className="font-semibold text-white mb-2">
                  I premi sono davvero reali?
                </h4>
                <p className="text-gray-400 text-sm">
                  Assolutamente! Tutti i premi sono fisici e verificati. 
                  Auto, gioielli, contanti e esperienze di lusso.
                </p>
              </div>
              
              <div className="p-4 bg-gray-800/30 rounded-lg">
                <h4 className="font-semibold text-white mb-2">
                  Come funziona la mappa?
                </h4>
                <p className="text-gray-400 text-sm">
                  Usi BUZZ per sbloccare aree circolari sulla mappa mondiale. 
                  Ogni area contiene indizi che ti guidano al premio.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Final CTA */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center py-8"
      >
        <Button
          size="lg"
          onClick={handleStartMission}
          className="bg-gradient-to-r from-[#00D1FF] to-[#F059FF] text-white font-bold px-12 py-4 text-lg"
        >
          <Star className="w-6 h-6 mr-3" />
          Diventa un Agente M1SSION™
          <ArrowRight className="w-6 h-6 ml-3" />
        </Button>
        
        <p className="text-gray-500 text-sm mt-4">
          Registrazione gratuita • 100 crediti inclusi • Premi reali
        </p>
      </motion.div>
    </div>
  );
};

export default HowItWorksPage;