
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Question {
  id: number;
  text: string;
  options: {
    id: string;
    text: string;
    score: {
      comandante: number;
      assaltatore: number;
      ricognitore: number;
    };
  }[];
}

interface ProfileQuizProps {
  onComplete: (profileType: string) => void;
  userId: string | null;
}

const quizQuestions: Question[] = [
  {
    id: 1,
    text: "In una situazione complessa, preferisci:",
    options: [
      { id: "a1", text: "Analizzare tutti i dati prima di decidere", score: { comandante: 3, assaltatore: 0, ricognitore: 1 } },
      { id: "a2", text: "Agire rapidamente basandoti sul tuo istinto", score: { comandante: 0, assaltatore: 3, ricognitore: 0 } },
      { id: "a3", text: "Parlare con diverse persone per ottenere informazioni", score: { comandante: 1, assaltatore: 0, ricognitore: 3 } }
    ]
  },
  {
    id: 2,
    text: "Quando cerchi un indizio, tendi a:",
    options: [
      { id: "b1", text: "Cercare modelli e connessioni", score: { comandante: 3, assaltatore: 0, ricognitore: 1 } },
      { id: "b2", text: "Esaminare fisicamente ogni possibile area", score: { comandante: 0, assaltatore: 3, ricognitore: 1 } },
      { id: "b3", text: "Chiedere a testimoni o persone informate", score: { comandante: 1, assaltatore: 0, ricognitore: 3 } }
    ]
  },
  {
    id: 3,
    text: "In una squadra, preferisci:",
    options: [
      { id: "c1", text: "Pianificare e coordinare le operazioni", score: { comandante: 3, assaltatore: 0, ricognitore: 0 } },
      { id: "c2", text: "Guidare l'azione sul campo", score: { comandante: 0, assaltatore: 3, ricognitore: 0 } },
      { id: "c3", text: "Raccogliere informazioni e fare da ponte tra i membri", score: { comandante: 0, assaltatore: 0, ricognitore: 3 } }
    ]
  },
  {
    id: 4,
    text: "Quando affronti un problema, il tuo approccio è:",
    options: [
      { id: "d1", text: "Logico e strutturato, valutando ogni possibile soluzione", score: { comandante: 3, assaltatore: 0, ricognitore: 1 } },
      { id: "d2", text: "Diretto e pratico, cercando la soluzione più immediata", score: { comandante: 0, assaltatore: 3, ricognitore: 0 } },
      { id: "d3", text: "Creativo e collaborativo, coinvolgendo diverse prospettive", score: { comandante: 0, assaltatore: 0, ricognitore: 3 } }
    ]
  },
  {
    id: 5,
    text: "Per te, il successo in una missione significa:",
    options: [
      { id: "e1", text: "Aver previsto ogni possibilità e controllato ogni variabile", score: { comandante: 3, assaltatore: 0, ricognitore: 0 } },
      { id: "e2", text: "Aver superato ogni ostacolo con determinazione e coraggio", score: { comandante: 0, assaltatore: 3, ricognitore: 0 } },
      { id: "e3", text: "Aver creato una rete di contatti e informazioni utili", score: { comandante: 0, assaltatore: 0, ricognitore: 3 } }
    ]
  },
  {
    id: 6,
    text: "Quando devi prendere una decisione importante:",
    options: [
      { id: "f1", text: "Analizzi attentamente pro e contro di ogni opzione", score: { comandante: 3, assaltatore: 0, ricognitore: 1 } },
      { id: "f2", text: "Ti fidi del tuo istinto e agisci rapidamente", score: { comandante: 0, assaltatore: 3, ricognitore: 0 } },
      { id: "f3", text: "Consideri l'impatto sulle persone coinvolte", score: { comandante: 0, assaltatore: 0, ricognitore: 3 } }
    ]
  }
];

const ProfileQuiz = ({ onComplete, userId }: ProfileQuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState({
    comandante: 0,
    assaltatore: 0,
    ricognitore: 0
  });
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleNextQuestion = () => {
    if (selectedOption === null) return;
    
    // Get the selected option
    const question = quizQuestions[currentQuestion];
    const option = question.options.find(opt => opt.id === selectedOption);
    
    if (option) {
      // Update scores
      setScores({
        comandante: scores.comandante + option.score.comandante,
        assaltatore: scores.assaltatore + option.score.assaltatore,
        ricognitore: scores.ricognitore + option.score.ricognitore
      });
    }
    
    // Start the transition animation
    setIsTransitioning(true);
    
    // Reset selected option and move to next question
    setTimeout(() => {
      setSelectedOption(null);
      
      if (currentQuestion < quizQuestions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        // Quiz completed, determine profile type
        completeQuiz();
      }
      
      setIsTransitioning(false);
    }, 500); // Match with animation duration
  };

  const completeQuiz = async () => {
    // Get the most scored profile type
    const profileType = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    
    // Save profile to Supabase if userId is available
    if (userId) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({ investigative_style: profileType })
          .eq('id', userId);
        
        if (error) {
          console.error("Error updating profile:", error);
        }
      } catch (error) {
        console.error("Error saving profile data:", error);
      }
    }
    
    // Call the onComplete callback with the profile type
    onComplete(profileType);
  };

  const question = quizQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100;

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="h-2 w-full bg-white/10 rounded-full">
            <div 
              className="h-2 bg-gradient-to-r from-projectx-blue to-projectx-pink rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="text-white/70 text-sm mt-2">Domanda {currentQuestion + 1} di {quizQuestions.length}</p>
        </div>
        
        {/* Quiz content */}
        <div className="bg-black/50 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: isTransitioning ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-bold text-white mb-6">{question.text}</h2>
              
              <div className="space-y-4">
                {question.options.map((option) => (
                  <button
                    key={option.id}
                    className={`w-full text-left p-4 rounded-lg transition-all duration-200 border ${
                      selectedOption === option.id 
                        ? "border-cyan-400 bg-cyan-400/10" 
                        : "border-white/10 bg-black/20 hover:bg-black/40"
                    }`}
                    onClick={() => handleOptionSelect(option.id)}
                  >
                    <span className="text-white/90">{option.text}</span>
                  </button>
                ))}
              </div>
              
              <div className="mt-8 flex justify-end">
                <Button
                  onClick={handleNextQuestion}
                  disabled={!selectedOption}
                  className={`bg-gradient-to-r from-projectx-blue to-projectx-pink ${
                    !selectedOption ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {currentQuestion < quizQuestions.length - 1 ? "Prossima Domanda" : "Completa Quiz"}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default ProfileQuiz;
