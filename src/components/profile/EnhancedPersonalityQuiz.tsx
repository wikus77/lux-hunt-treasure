// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Question {
  id: number;
  text: string;
  options: {
    text: string;
    scores: {
      analyst: number;
      operative: number;
      tactician: number;
      engineer: number;
      ghost: number;
    };
  }[];
}

interface PlayerType {
  id: string;
  name: string;
  description: string;
  color: string;
  icon: string;
}

const playerTypes: PlayerType[] = [
  {
    id: "analyst",
    name: "Investigatore",
    description: "Maestro nell'analisi di indizi e nella decodifica di segnali. Ogni dettaglio diventa una prova.",
    color: "#00D1FF",
    icon: "🔍"
  },
  {
    id: "operative", 
    name: "Commando",
    description: "Agente da prima linea. Azione rapida, decisioni fulminee, interventi diretti.",
    color: "#F213A4",
    icon: "⚡"
  },
  {
    id: "tactician",
    name: "Stratega", 
    description: "Pianificatore meticoloso. Ogni mossa è calcolata, ogni passo è previsto.",
    color: "#FFD700",
    icon: "🎯"
  },
  {
    id: "engineer",
    name: "Ingegnere",
    description: "Specialista in tecnologia, hacking e soluzioni creative per aggirare ogni ostacolo.",
    color: "#00FF88",
    icon: "🛠️"
  },
  {
    id: "ghost",
    name: "Operatore Invisibile",
    description: "Agisce nell'ombra, non lascia tracce, ma il suo impatto è decisivo. (categoria bonus M1SSION™)",
    color: "#8B5CF6",
    icon: "👤"
  }
];

const quizQuestions: Question[] = [
  {
    id: 1,
    text: "Ti trovi di fronte a una situazione critica con informazioni limitate. Qual è il tuo primo istinto?",
    options: [
      {
        text: "Raccolgo tutti i dati disponibili e li analizzo sistematicamente",
        scores: { analyst: 3, operative: 0, tactician: 1, engineer: 0, ghost: 0 }
      },
      {
        text: "Agisco immediatamente basandomi sull'esperienza",
        scores: { analyst: 0, operative: 3, tactician: 0, engineer: 0, ghost: 1 }
      },
      {
        text: "Creo una strategia considerando tutti i possibili scenari",
        scores: { analyst: 1, operative: 0, tactician: 3, engineer: 0, ghost: 0 }
      },
      {
        text: "Cerco soluzioni tecnologiche o innovative",
        scores: { analyst: 0, operative: 0, tactician: 0, engineer: 3, ghost: 1 }
      },
      {
        text: "Osservo in silenzio prima di muovermi",
        scores: { analyst: 1, operative: 0, tactician: 1, engineer: 0, ghost: 3 }
      }
    ]
  },
  {
    id: 2,
    text: "Durante una missione di squadra, preferisci:",
    options: [
      {
        text: "Essere il cervello dell'operazione, coordinando le informazioni",
        scores: { analyst: 3, operative: 0, tactician: 1, engineer: 1, ghost: 0 }
      },
      {
        text: "Guidare il team in prima linea",
        scores: { analyst: 0, operative: 3, tactician: 2, engineer: 0, ghost: 0 }
      },
      {
        text: "Pianificare ogni dettaglio dell'operazione",
        scores: { analyst: 1, operative: 0, tactician: 3, engineer: 0, ghost: 0 }
      },
      {
        text: "Fornire supporto tecnico e soluzioni innovative",
        scores: { analyst: 0, operative: 0, tactician: 0, engineer: 3, ghost: 1 }
      },
      {
        text: "Operare autonomamente con obiettivi specifici",
        scores: { analyst: 0, operative: 1, tactician: 0, engineer: 1, ghost: 3 }
      }
    ]
  },
  {
    id: 3,
    text: "Qual è la tua risorsa più preziosa in una missione?",
    options: [
      {
        text: "La mia capacità di osservazione e deduzione",
        scores: { analyst: 3, operative: 0, tactician: 0, engineer: 0, ghost: 2 }
      },
      {
        text: "I miei riflessi e la capacità di adattamento",
        scores: { analyst: 0, operative: 3, tactician: 0, engineer: 1, ghost: 1 }
      },
      {
        text: "La mia esperienza e conoscenza strategica",
        scores: { analyst: 1, operative: 1, tactician: 3, engineer: 0, ghost: 0 }
      },
      {
        text: "Le mie competenze tecniche e creatività",
        scores: { analyst: 0, operative: 0, tactician: 0, engineer: 3, ghost: 1 }
      },
      {
        text: "La mia discrezione e capacità di mimetizzarmi",
        scores: { analyst: 1, operative: 0, tactician: 0, engineer: 0, ghost: 3 }
      }
    ]
  },
  {
    id: 4,
    text: "Come preferisci comunicare informazioni critiche?",
    options: [
      {
        text: "Report dettagliati con prove e analisi complete",
        scores: { analyst: 3, operative: 0, tactician: 1, engineer: 0, ghost: 0 }
      },
      {
        text: "Comunicazioni dirette e immediate",
        scores: { analyst: 0, operative: 3, tactician: 0, engineer: 0, ghost: 1 }
      },
      {
        text: "Briefing strutturati con piani alternativi",
        scores: { analyst: 1, operative: 0, tactician: 3, engineer: 0, ghost: 0 }
      },
      {
        text: "Sistemi sicuri e canali criptati",
        scores: { analyst: 0, operative: 0, tactician: 0, engineer: 3, ghost: 2 }
      },
      {
        text: "Solo quando strettamente necessario, con codici",
        scores: { analyst: 0, operative: 0, tactician: 0, engineer: 1, ghost: 3 }
      }
    ]
  },
  {
    id: 5,
    text: "Di fronte a un sistema di sicurezza avanzato, come procedi?",
    options: [
      {
        text: "Studio i pattern e cerco vulnerabilità logiche",
        scores: { analyst: 3, operative: 0, tactician: 1, engineer: 1, ghost: 0 }
      },
      {
        text: "Cerco una via di accesso diretta e rapida",
        scores: { analyst: 0, operative: 3, tactician: 0, engineer: 0, ghost: 1 }
      },
      {
        text: "Creo un piano multi-fase per aggirarlo",
        scores: { analyst: 0, operative: 0, tactician: 3, engineer: 1, ghost: 1 }
      },
      {
        text: "Uso tool tecnologici per bypassarlo",
        scores: { analyst: 1, operative: 0, tactician: 0, engineer: 3, ghost: 0 }
      },
      {
        text: "Aspetto il momento giusto e mi infiltro invisibilmente",
        scores: { analyst: 0, operative: 0, tactician: 1, engineer: 0, ghost: 3 }
      }
    ]
  },
  {
    id: 6,
    text: "Il tuo approccio ideale per raccogliere intelligence è:",
    options: [
      {
        text: "Analisi di fonti multiple e cross-referencing",
        scores: { analyst: 3, operative: 0, tactician: 1, engineer: 1, ghost: 0 }
      },
      {
        text: "Interrogatori diretti e acquisizione rapida",
        scores: { analyst: 0, operative: 3, tactician: 0, engineer: 0, ghost: 0 }
      },
      {
        text: "Network di contatti e intelligence predittiva",
        scores: { analyst: 1, operative: 0, tactician: 3, engineer: 0, ghost: 1 }
      },
      {
        text: "Intercettazioni digitali e data mining",
        scores: { analyst: 1, operative: 0, tactician: 0, engineer: 3, ghost: 1 }
      },
      {
        text: "Osservazione prolungata e infiltrazione silenziosa",
        scores: { analyst: 1, operative: 0, tactician: 0, engineer: 0, ghost: 3 }
      }
    ]
  },
  {
    id: 7,
    text: "Qual è il tuo stile di lavoro ideale per M1SSION™?",
    options: [
      {
        text: "Laboratorio/base operativa con accesso a database e archivi",
        scores: { analyst: 3, operative: 0, tactician: 1, engineer: 1, ghost: 0 }
      },
      {
        text: "Sul campo, in movimento, sempre pronti all'azione",
        scores: { analyst: 0, operative: 3, tactician: 0, engineer: 0, ghost: 1 }
      },
      {
        text: "Centro di comando con overview completa dell'operazione",
        scores: { analyst: 1, operative: 1, tactician: 3, engineer: 0, ghost: 0 }
      },
      {
        text: "Tech hub con strumenti avanzati e connettività",
        scores: { analyst: 0, operative: 0, tactician: 0, engineer: 3, ghost: 1 }
      },
      {
        text: "Ovunque, mantenendo sempre un profilo basso",
        scores: { analyst: 0, operative: 0, tactician: 0, engineer: 1, ghost: 3 }
      }
    ]
  }
];

interface EnhancedPersonalityQuizProps {
  onComplete: (playerType: PlayerType) => void;
  userId: string;
}

const EnhancedPersonalityQuiz: React.FC<EnhancedPersonalityQuizProps> = ({ onComplete, userId }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [scores, setScores] = useState({
    analyst: 0,
    operative: 0,
    tactician: 0,
    engineer: 0,
    ghost: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
  };

  const handleNextQuestion = async () => {
    if (selectedOption === null) return;

    const option = quizQuestions[currentQuestion].options[selectedOption];
    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);

    // Add scores
    const newScores = { ...scores };
    Object.keys(option.scores).forEach(key => {
      newScores[key as keyof typeof scores] += option.scores[key as keyof typeof option.scores];
    });
    setScores(newScores);

    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    } else {
      await completeQuiz(newAnswers, newScores);
    }
  };

  const completeQuiz = async (finalAnswers: number[], finalScores: any) => {
    setIsLoading(true);
    
    try {
      // Determine the highest scoring type
      let highestType = 'analyst';
      let highestScore = finalScores.analyst;
      
      Object.keys(finalScores).forEach(type => {
        if (finalScores[type] > highestScore) {
          highestScore = finalScores[type];
          highestType = type;
        }
      });

      const assignedPlayerType = playerTypes.find(type => type.id === highestType) || playerTypes[0];

      // Save only the investigative style (tipo agente) to Supabase
      const { error } = await supabase.rpc('update_personality_quiz_result', {
        p_user_id: userId,
        p_investigative_style: assignedPlayerType.name
      });

      if (error) {
        console.error('Quiz save error:', error);
        toast.error('Errore nel salvare il risultato del quiz. Riprova.');
        return;
      }

      toast.success(`Profilo assegnato: ${assignedPlayerType.name}!`);
      onComplete(assignedPlayerType);
    } catch (error) {
      console.error('Quiz completion error:', error);
      toast.error('Errore durante il completamento del quiz. Riprova.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkipQuiz = async () => {
    setIsLoading(true);
    try {
      // Mark first login as completed without assigning investigative style
      const { error } = await supabase
        .from('profiles')
        .update({ first_login_completed: true })
        .eq('id', userId);

      if (error) throw error;

      toast.info('Quiz saltato. Potrai completarlo in seguito.');
      onComplete(null as any); // Signal skip to parent
    } catch (error) {
      console.error('Skip quiz error:', error);
      toast.error('Errore. Riprova.');
    } finally {
      setIsLoading(false);
    }
  };

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  return (
    <div className="w-full bg-gradient-to-b from-[#131524]/90 to-black/95 p-2 sm:p-4 py-3 sm:py-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-2xl mx-auto"
      >
        <Card className="bg-black/60 border-[#00D1FF]/30 backdrop-blur-sm">
          <CardHeader className="text-center space-y-2 sm:space-y-3 p-3 sm:p-4">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <CardTitle className="text-xl sm:text-2xl font-orbitron text-white">
                Quiz Personalità Agente
              </CardTitle>
              <p className="text-white/70 text-xs sm:text-sm mt-2">
                Scopri il tuo tipo di agente M1SSION™
              </p>
            </motion.div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-white/60">
                <span>Domanda {currentQuestion + 1} di {quizQuestions.length}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-white/10" />
            </div>
          </CardHeader>

          <CardContent className="space-y-3 sm:space-y-4 p-3 sm:p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <h3 className="text-base sm:text-lg font-medium text-white leading-relaxed">
                  {quizQuestions[currentQuestion].text}
                </h3>

                <div className="space-y-2 sm:space-y-3">
                  {quizQuestions[currentQuestion].options.map((option, index) => (
                    <motion.button
                      key={index}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleOptionSelect(index)}
                      className={`w-full p-3 sm:p-4 text-left rounded-lg border transition-all duration-200 ${
                        selectedOption === index
                          ? 'border-[#00D1FF] bg-[#00D1FF]/10 text-white'
                          : 'border-white/20 bg-white/5 text-white/80 hover:border-white/40 hover:bg-white/10'
                      }`}
                    >
                      <span className="text-xs sm:text-sm leading-relaxed">{option.text}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex justify-between items-center pt-3 gap-2">
              <Button
                onClick={handleSkipQuiz}
                disabled={isLoading}
                variant="outline"
                className="border-white/20 text-white/80 hover:bg-white/10 hover:text-white px-3 sm:px-4 text-xs sm:text-sm h-9 sm:h-10"
              >
                Salta Quiz
              </Button>
              
              <Button
                onClick={handleNextQuestion}
                disabled={selectedOption === null || isLoading}
                className="bg-[#00D1FF] hover:bg-[#00A3CC] text-black font-medium px-4 sm:px-6 text-xs sm:text-sm h-9 sm:h-10"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    <span>Elaborazione...</span>
                  </div>
                ) : currentQuestion < quizQuestions.length - 1 ? (
                  'Prossima Domanda'
                ) : (
                  'Completa Quiz'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Player Types Preview */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-3 sm:mt-4"
        >
          <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
            <CardHeader className="p-3 sm:p-4">
              <CardTitle className="text-center text-white font-orbitron text-sm sm:text-base">
                Tipi di Agente M1SSION™
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {playerTypes.map((type) => (
                  <div
                    key={type.id}
                    className="text-center p-2 sm:p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="text-xl sm:text-2xl mb-1 sm:mb-2">{type.icon}</div>
                    <Badge 
                      variant="outline" 
                      className="text-[10px] sm:text-xs mb-1 sm:mb-2"
                      style={{ borderColor: type.color, color: type.color }}
                    >
                      {type.name}
                    </Badge>
                    <p className="text-white/70 text-[10px] sm:text-xs leading-relaxed">
                      {type.description}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default EnhancedPersonalityQuiz;