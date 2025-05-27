
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';
import { MessageSquare, CheckCircle, X, RotateCcw, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Answer {
  questionId: number;
  selectedAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
}

const questions: Question[] = [
  {
    id: 1,
    question: "Qual è il nome in codice del primo agente M1SSION?",
    options: ["AG-ALPHA", "AG-ZERO", "AG-X0197", "AG-PRIME"],
    correctAnswer: 2
  },
  {
    id: 2,
    question: "Cosa si deve evitare durante un'operazione stealth?",
    options: ["Luci intense", "Contatto visivo", "Rumori forti", "Tutto quanto sopra"],
    correctAnswer: 3
  },
  {
    id: 3,
    question: "Qual è la funzione del modulo Delta?",
    options: ["Tracciamento satellitare", "Analisi biometrica", "Crifratura dati", "Comunicazione sicura"],
    correctAnswer: 0
  },
  {
    id: 4,
    question: "Quale protocollo seguire in caso di compromissione?",
    options: ["Evacuazione immediata", "Attesa rinforzi", "Autodistruzione", "Comunicazione base"],
    correctAnswer: 0
  },
  {
    id: 5,
    question: "Qual è il tempo massimo per una missione BUZZ?",
    options: ["30 secondi", "60 secondi", "2 minuti", "5 minuti"],
    correctAnswer: 1
  }
];

const FlashInterrogationGame = () => {
  const { user } = useAuthContext();
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'completed'>('waiting');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [timeLeft, setTimeLeft] = useState(7);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [questionStartTime, setQuestionStartTime] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const initializeGame = useCallback(() => {
    // Select 3 random questions
    const shuffled = [...questions].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    
    setSelectedQuestions(selected);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setGameState('playing');
    setTimeLeft(7);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setQuestionStartTime(Date.now());
  }, []);

  // Timer countdown
  useEffect(() => {
    if (gameState !== 'playing' || showFeedback) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, showFeedback, currentQuestionIndex]);

  const handleTimeUp = () => {
    if (selectedAnswer === null) {
      // Time up with no answer
      const timeSpent = Date.now() - questionStartTime;
      const newAnswer: Answer = {
        questionId: selectedQuestions[currentQuestionIndex].id,
        selectedAnswer: -1, // No answer
        isCorrect: false,
        timeSpent
      };
      
      setAnswers(prev => [...prev, newAnswer]);
      setShowFeedback(true);
      
      setTimeout(() => {
        moveToNextQuestion();
      }, 1500);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswer !== null || showFeedback) return;
    
    const timeSpent = Date.now() - questionStartTime;
    const currentQuestion = selectedQuestions[currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    
    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      selectedAnswer: answerIndex,
      isCorrect,
      timeSpent
    };
    
    setSelectedAnswer(answerIndex);
    setAnswers(prev => [...prev, newAnswer]);
    setShowFeedback(true);
    
    setTimeout(() => {
      moveToNextQuestion();
    }, 1500);
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex + 1 >= selectedQuestions.length) {
      // Game completed
      setGameState('completed');
      saveGameProgress();
    } else {
      // Next question
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setTimeLeft(7);
      setQuestionStartTime(Date.now());
    }
  };

  const saveGameProgress = async () => {
    if (!user) return;

    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const totalQuestions = selectedQuestions.length;
    const allCorrect = correctAnswers === totalQuestions;
    const averageTime = answers.reduce((sum, a) => sum + a.timeSpent, 0) / answers.length;

    try {
      if (allCorrect) {
        // Save game progress only if all correct
        const { error: gameError } = await supabase
          .from('user_minigames_progress')
          .upsert({
            user_id: user.id,
            game_key: 'lightning_interrogation',
            completed: true,
            score: 5,
            last_played: new Date().toISOString()
          });

        if (gameError) throw gameError;

        // Add buzz bonus
        const { error: bonusError } = await supabase
          .from('user_buzz_bonuses')
          .insert({
            user_id: user.id,
            bonus_type: 'discount',
            game_reference: 'lightning_interrogation',
            awarded_at: new Date().toISOString()
          });

        if (!bonusError) {
          toast.success("INTERROGATORIO SUPERATO!", {
            description: `Tutte le risposte corrette! Bonus sconto sbloccato!`
          });
        }
      }
    } catch (error) {
      console.error('Error saving game progress:', error);
    }
  };

  const resetGame = () => {
    setGameState('waiting');
    setCurrentQuestionIndex(0);
    setSelectedQuestions([]);
    setAnswers([]);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setTimeLeft(7);
  };

  const correctCount = answers.filter(a => a.isCorrect).length;
  const averageTime = answers.length > 0 ? answers.reduce((sum, a) => sum + a.timeSpent, 0) / answers.length : 0;
  const timerPercentage = (timeLeft / 7) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-black/90 backdrop-blur-md border border-white/20 rounded-xl relative overflow-hidden">
      {/* Background particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-2 h-2 bg-[#00D1FF]/30 rounded-full animate-pulse" style={{ top: '20%', left: '10%' }} />
        <div className="absolute w-1 h-1 bg-red-400/40 rounded-full animate-pulse" style={{ top: '60%', right: '15%', animationDelay: '1s' }} />
        <div className="absolute w-1.5 h-1.5 bg-[#00D1FF]/20 rounded-full animate-pulse" style={{ bottom: '30%', left: '20%', animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <div className="text-center mb-6 relative z-10">
        <div className="flex items-center justify-center gap-3 mb-2">
          <MessageSquare className="w-8 h-8 text-[#00D1FF]" />
          <h2 className="text-2xl font-orbitron font-bold tracking-widest">
            <span className="text-[#00D1FF] neon-text" style={{ 
              textShadow: "0 0 10px rgba(0, 209, 255, 0.6)"
            }}>INTERROGATORIO</span>{' '}
            <span className="text-white">LAMPO</span>
          </h2>
        </div>
        <p className="text-[#00D1FF] font-sans text-sm mb-1">Rispondi a 3 domande in 7 secondi ciascuna</p>
        <p className="text-white/60 font-sans text-xs">Solo le risposte perfette contano</p>
      </div>

      {/* Game Area */}
      {gameState === 'waiting' && (
        <div className="text-center relative z-10">
          <Button 
            onClick={initializeGame}
            className="bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] hover:from-[#00A3FF] hover:to-[#6B1EFF] text-white px-8 py-3 rounded-xl font-sans transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(0,209,255,0.4)]"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            INIZIA INTERROGATORIO
          </Button>
        </div>
      )}

      {gameState === 'playing' && selectedQuestions.length > 0 && (
        <div className="space-y-6 relative z-10">
          {/* Progress and Timer */}
          <div className="flex justify-between items-center">
            <div className="text-[#00D1FF] font-bold font-sans">
              Domanda {currentQuestionIndex + 1} di {selectedQuestions.length}
            </div>
            
            <div className="flex items-center gap-2">
              <Clock className={`w-5 h-5 ${timeLeft <= 3 ? 'text-red-400' : 'text-[#00D1FF]'}`} />
              <div className="relative inline-block">
                <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 100 100">
                  <circle 
                    cx="50" cy="50" r="45" 
                    fill="none" 
                    stroke="rgba(255,255,255,0.1)" 
                    strokeWidth="8"
                  />
                  <circle 
                    cx="50" cy="50" r="45" 
                    fill="none" 
                    stroke={timeLeft <= 3 ? "#ff4d4d" : "#00D1FF"}
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - timerPercentage / 100)}`}
                    className="transition-all duration-1000"
                    style={{
                      filter: timeLeft <= 3 ? 'drop-shadow(0 0 8px rgba(255, 77, 77, 0.8))' : 'drop-shadow(0 0 8px rgba(0, 209, 255, 0.6))'
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-lg font-bold ${timeLeft <= 3 ? 'text-red-400' : 'text-[#00D1FF]'}`}>
                    {timeLeft}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Question */}
          <motion.div 
            key={currentQuestionIndex}
            className="text-center p-6 bg-gradient-to-r from-[#00D1FF]/10 via-[#00D1FF]/20 to-[#00D1FF]/10 border border-[#00D1FF]/30 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-white font-bold font-sans text-lg mb-6">
              {selectedQuestions[currentQuestionIndex].question}
            </h3>

            {/* Answer Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedQuestions[currentQuestionIndex].options.map((option, index) => {
                let buttonClass = "bg-gray-800/50 hover:bg-gray-700/50 border-gray-600/50 text-white";
                
                if (showFeedback) {
                  if (index === selectedQuestions[currentQuestionIndex].correctAnswer) {
                    buttonClass = "bg-green-600/80 border-green-400 text-white";
                  } else if (index === selectedAnswer && selectedAnswer !== selectedQuestions[currentQuestionIndex].correctAnswer) {
                    buttonClass = "bg-red-600/80 border-red-400 text-white";
                  }
                }

                return (
                  <motion.button
                    key={index}
                    onClick={() => handleAnswerSelect(index)}
                    disabled={selectedAnswer !== null || showFeedback}
                    className={`p-4 rounded-xl border-2 font-sans font-bold tracking-wide transition-all duration-300 ${buttonClass}`}
                    whileHover={selectedAnswer === null ? { scale: 1.02 } : {}}
                    whileTap={selectedAnswer === null ? { scale: 0.98 } : {}}
                  >
                    {option}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </div>
      )}

      {/* Completed State */}
      {gameState === 'completed' && (
        <motion.div 
          className="text-center space-y-6 relative z-10"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            {correctCount === selectedQuestions.length ? (
              <>
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" style={{
                  filter: 'drop-shadow(0 0 15px rgba(34, 197, 94, 0.6))'
                }} />
                <div className="absolute inset-0 w-16 h-16 mx-auto mb-4 rounded-full bg-green-400/20 blur-xl" />
              </>
            ) : (
              <X className="w-16 h-16 text-red-400 mx-auto mb-4" style={{
                filter: 'drop-shadow(0 0 15px rgba(239, 68, 68, 0.6))'
              }} />
            )}
          </motion.div>
          
          <div>
            {correctCount === selectedQuestions.length ? (
              <>
                <h3 className="text-xl font-bold text-green-400 font-orbitron tracking-widest mb-4">
                  INTERROGATORIO SUPERATO!
                </h3>
                <p className="text-white/70 mb-4 font-sans">
                  Tutte le risposte corrette!<br />
                  Tempo medio: {(averageTime / 1000).toFixed(1)}s
                  <span className="block text-yellow-400 font-bold mt-2">
                    🏆 BONUS SCONTO SBLOCCATO!
                  </span>
                </p>
              </>
            ) : (
              <>
                <h3 className="text-xl font-bold text-red-400 font-orbitron tracking-widest mb-4">
                  AGENTE SOTTO PRESSIONE
                </h3>
                <p className="text-white/70 mb-4 font-sans">
                  {correctCount} su {selectedQuestions.length} risposte corrette<br />
                  Tempo medio: {(averageTime / 1000).toFixed(1)}s<br />
                  <span className="text-yellow-300">Serve il 100% per superare l'interrogatorio</span>
                </p>
              </>
            )}
          </div>
          
          <Button 
            onClick={resetGame}
            className={`px-8 py-3 rounded-xl font-sans transition-all duration-300 hover:scale-105 ${
              correctCount === selectedQuestions.length 
                ? 'bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] hover:from-[#00A3FF] hover:to-[#6B1EFF] text-white hover:shadow-[0_0_20px_rgba(0,209,255,0.4)]'
                : 'bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.4)]'
            }`}
          >
            {correctCount === selectedQuestions.length ? (
              'NUOVO INTERROGATORIO'
            ) : (
              <>
                <RotateCcw className="w-5 h-5 mr-2" />
                RIPROVA
              </>
            )}
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default FlashInterrogationGame;
