
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Question {
  text: string;
  answers: {
    text: string;
    profileType: "comandante" | "assaltatore" | "nexus";
  }[];
}

const questions: Question[] = [
  {
    text: "Missione attiva. Un segnale sospetto viene rilevato in una zona a rischio. Come reagisci?",
    answers: [
      {
        text: "Analizzo il terreno, studio possibili vie di fuga e definisco un piano d'ingresso.",
        profileType: "comandante"
      },
      {
        text: "Intervengo immediatamente. Il tempo è un lusso che non possiamo permetterci.",
        profileType: "assaltatore"
      },
      {
        text: "Avverto la squadra e organizzo un ingresso sincronizzato.",
        profileType: "nexus"
      }
    ]
  },
  {
    text: "Un agente ha commesso un errore critico che compromette l'operazione. Tu…",
    answers: [
      {
        text: "Mantengo la calma. Ricalcolo le variabili e correggo la rotta.",
        profileType: "comandante"
      },
      {
        text: "Reagisco sul momento. Abbiamo bisogno di rimetterci in marcia subito.",
        profileType: "assaltatore"
      },
      {
        text: "Lo supporto, rialzo il morale e rafforzo il legame tra gli operatori.",
        profileType: "nexus"
      }
    ]
  },
  {
    text: "Un file criptato blocca l'accesso al prossimo obiettivo. Hai pochi minuti.",
    answers: [
      {
        text: "Identifico il pattern e inizio il decrittaggio logico.",
        profileType: "comandante"
      },
      {
        text: "Provo una forzatura diretta: rischio alto, ma potrebbe funzionare.",
        profileType: "assaltatore"
      },
      {
        text: "Chiamo un alleato esperto per lavorarci insieme.",
        profileType: "nexus"
      }
    ]
  },
  {
    text: "Durante un'imboscata, la squadra è disorientata. Qual è la tua priorità?",
    answers: [
      {
        text: "Riorganizzare le posizioni, valutare i punti deboli del nemico.",
        profileType: "comandante"
      },
      {
        text: "Contrattaccare. La miglior difesa è l'offensiva.",
        profileType: "assaltatore"
      },
      {
        text: "Garantire che tutti siano coperti e possano ripiegare in sicurezza.",
        profileType: "nexus"
      }
    ]
  },
  {
    text: "Il tuo punto di forza sul campo è…",
    answers: [
      {
        text: "Il controllo. Ogni scelta è calcolata.",
        profileType: "comandante"
      },
      {
        text: "La reattività. Agisco prima che gli altri pensino.",
        profileType: "assaltatore"
      },
      {
        text: "La connessione. Nessuno resta indietro.",
        profileType: "nexus"
      }
    ]
  },
  {
    text: "In un'unità d'élite, quale ruolo vorresti?",
    answers: [
      {
        text: "Stratega e coordinatore della missione.",
        profileType: "comandante"
      },
      {
        text: "Primo operatore operativo sul campo.",
        profileType: "assaltatore"
      },
      {
        text: "Leader relazionale, punto di riferimento per la squadra.",
        profileType: "nexus"
      }
    ]
  }
];

interface ProfileQuizProps {
  onComplete: (profileType: string) => void;
}

const ProfileQuiz = ({ onComplete }: ProfileQuizProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [scores, setScores] = useState({
    comandante: 0,
    assaltatore: 0,
    nexus: 0
  });
  const [showIntro, setShowIntro] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const [profileResult, setProfileResult] = useState<string | null>(null);
  const { toast } = useToast();

  const handleStartQuiz = () => {
    setShowIntro(false);
  };

  const handleAnswer = (profileType: "comandante" | "assaltatore" | "nexus") => {
    // Update scores
    setScores(prev => ({
      ...prev,
      [profileType]: prev[profileType] + 1
    }));
    
    // Move to next question or show result
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      determineProfile();
    }
  };

  const determineProfile = () => {
    let dominantProfile = "comandante"; // Default
    
    if (scores.comandante > scores.assaltatore && scores.comandante > scores.nexus) {
      dominantProfile = "comandante";
    } else if (scores.assaltatore > scores.comandante && scores.assaltatore > scores.nexus) {
      dominantProfile = "assaltatore";
    } else if (scores.nexus > scores.comandante && scores.nexus > scores.assaltatore) {
      dominantProfile = "nexus";
    } else {
      // In case of a tie, default to comandante
      dominantProfile = "comandante";
    }
    
    setProfileResult(dominantProfile);
    setShowResult(true);
    
    // Save the profile to the local storage for future use
    localStorage.setItem("userProfileType", dominantProfile);
    
    // If we have Supabase authentication, we can save the profile to the user's data
    const saveProfileToSupabase = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        try {
          const { error } = await supabase
            .from('profiles')
            .update({ investigative_style: dominantProfile })
            .eq('id', session.user.id);
            
          if (error) throw error;
          
          console.log("Profile updated successfully");
        } catch (error) {
          console.error("Error updating profile:", error);
        }
      }
    };
    
    saveProfileToSupabase();
  };

  const handleCompleteQuiz = () => {
    if (profileResult) {
      toast({
        title: "Profilo salvato",
        description: `Il tuo stile investigativo è stato salvato: ${profileResult === "comandante" ? "Comandante" : profileResult === "assaltatore" ? "Assaltatore" : "Nexus"}`,
      });
      onComplete(profileResult);
    }
  };

  const getProfileDescription = () => {
    switch (profileResult) {
      case "comandante":
        return {
          title: "SEI UN COMANDANTE",
          description: "Vedi il campo da battaglia con chiarezza. Ogni mossa ha uno scopo, ogni scelta pesa. Sei nato per dirigere."
        };
      case "assaltatore":
        return {
          title: "SEI UN ASSALTATORE",
          description: "La tua forza è l'istinto. Sei il primo a entrare, l'ultimo a mollare. Dove gli altri esitano, tu agisci."
        };
      case "nexus":
        return {
          title: "SEI UN NEXUS",
          description: "Tu sei il collegamento. Il legame tra i pezzi. Senza di te, la squadra si disintegra. Sei l'anima della rete."
        };
      default:
        return {
          title: "PROFILO MISTO",
          description: "Hai caratteristiche multiple. Ma per iniziare la M1SSION, ti affideremo al Comandante. L'equilibrio inizia dalla mente."
        };
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {showIntro ? (
          <motion.div 
            className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-6 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2 text-white">🎭 Prima di iniziare...</h2>
              <p className="text-md text-gray-300 mb-4">
                Ogni grande investigatore ha un suo stile.<br />
                Scopri qual è il tuo e lascia che ti guidi nella M1SSION.
              </p>
              <div className="p-4 bg-gradient-to-r from-[#00D1FF]/20 to-[#7B2EFF]/20 rounded-lg mb-6">
                <p className="text-cyan-400 font-medium">
                  Rispondi a 6 semplici domande per definire il tuo profilo operativo
                </p>
              </div>
            </div>
            <Button 
              onClick={handleStartQuiz}
              className="w-full bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Inizia il questionario
            </Button>
          </motion.div>
        ) : showResult ? (
          <motion.div 
            className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-6 space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
                style={{
                  background: profileResult === "comandante" 
                    ? "linear-gradient(135deg, rgba(0, 209, 255, 0.3), rgba(0, 209, 255, 0.1))" 
                    : profileResult === "assaltatore"
                    ? "linear-gradient(135deg, rgba(255, 59, 59, 0.3), rgba(255, 59, 59, 0.1))"
                    : "linear-gradient(135deg, rgba(123, 46, 255, 0.3), rgba(123, 46, 255, 0.1))"
                }}
              >
                <span className="text-4xl">
                  {profileResult === "comandante" 
                    ? "🧠" 
                    : profileResult === "assaltatore"
                    ? "🔥"
                    : "🌐"}
                </span>
              </motion.div>

              <h2 className="text-2xl font-bold mb-4 text-white">
                {getProfileDescription().title}
              </h2>
              
              <p className="text-md text-gray-300 mb-8">
                {getProfileDescription().description}
              </p>
            </div>
            
            <Button 
              onClick={handleCompleteQuiz}
              className="w-full bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] text-white py-3 px-6 rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Inizia la tua M1SSION
            </Button>
          </motion.div>
        ) : (
          <motion.div 
            key={currentQuestion}
            className="bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-6"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-cyan-400 text-sm font-mono">DOMANDA {currentQuestion + 1}/6</span>
                <div className="h-1 bg-white/10 rounded-full w-32 sm:w-48">
                  <div 
                    className="h-1 bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] rounded-full"
                    style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>
              <h3 className="text-xl font-medium mb-6 text-white">{questions[currentQuestion].text}</h3>
            </div>

            <div className="space-y-3">
              {questions[currentQuestion].answers.map((answer, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full text-left justify-start py-4 px-5 hover:bg-white/5 border border-white/10 transition-colors"
                  onClick={() => handleAnswer(answer.profileType)}
                >
                  <span className="inline-block w-6 h-6 rounded-full mr-3 flex items-center justify-center border border-white/30 text-xs">
                    {String.fromCharCode(65 + index)}
                  </span>
                  {answer.text}
                </Button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProfileQuiz;
