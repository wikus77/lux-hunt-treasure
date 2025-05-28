
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Clock, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  timeLimit: number;
}

const FlashInterrogationGame: React.FC = () => {
  const [questions] = useState<Question[]>([
    {
      id: 1,
      question: "Quale città italiana è famosa per la Torre Pendente?",
      options: ["Roma", "Pisa", "Milano", "Firenze"],
      correctAnswer: 1,
      timeLimit: 5
    },
    {
      id: 2,
      question: "In che anno è caduto il Muro di Berlino?",
      options: ["1987", "1989", "1991", "1993"],
      correctAnswer: 1,
      timeLimit: 4
    },
    {
      id: 3,
      question: "Qual è l'elemento chimico con simbolo 'Au'?",
      options: ["Argento", "Oro", "Alluminio", "Arsenico"],
      correctAnswer: 1,
      timeLimit: 3
    },
    {
      id: 4,
      question: "Chi ha scritto 'La Divina Commedia'?",
      options: ["Petrarca", "Boccaccio", "Dante", "Machiavelli"],
      correctAnswer: 2,
      timeLimit: 4
    },
    {
      id: 5,
      question: "Quanti continenti ci sono?",
      options: ["5", "6", "7", "8"],
      correctAnswer: 2,
      timeLimit: 3
    }
  ]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !isGameComplete && timeLeft > 0 && !showResult) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, isGameComplete, timeLeft, showResult]);

  const startGame = () => {
    setCurrentQuestionIndex(0);
    setCorrectAnswers(0);
    setIsGameComplete(false);
    setGameStarted(true);
    setSelectedAnswer(null);
    setShowResult(false);
    setTimeLeft(currentQuestion.timeLimit);
  };

  const handleTimeUp = () => {
    setShowResult(true);
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const selectAnswer = (answerIndex: number) => {
    if (selectedAnswer !== null || showResult) return;
    
    setSelectedAnswer(answerIndex);
    setShowResult(true);
    
    if (answerIndex === currentQuestion.correctAnswer) {
      setCorrectAnswers(prev => prev + 1);
    }
    
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(questions[currentQuestionIndex + 1].timeLimit);
    } else {
      finishGame();
    }
  };

  const finishGame = async () => {
    setIsGameComplete(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const score = (correctAnswers / questions.length) * 1000;
        
        // Save progress using type assertion
        await (supabase as any)
          .from('user_minigames_progress')
          .upsert({
            user_id: user.id,
            game_key: 'flash_interrogation',
            score: Math.round(score),
            completed: true,
            last_played: new Date().toISOString()
          }, {
            onConflict: 'user_id,game_key'
          });

        // Award bonus
        await (supabase as any)
          .from('user_buzz_bonuses')
          .insert({
            user_id: user.id,
            bonus_type: 'flash_interrogation_completion',
            game_reference: 'flash_interrogation',
            used: false
          });
      }
    } catch (error) {
      console.error('Error saving game progress:', error);
    }
    
    toast.success(`Interrogatorio completato! Risposte corrette: ${correctAnswers}/${questions.length}`);
  };

  const resetGame = () => {
    setCurrentQuestionIndex(0);
    setTimeLeft(0);
    setCorrectAnswers(0);
    setIsGameComplete(false);
    setGameStarted(false);
    setSelectedAnswer(null);
    setShowResult(false);
  };

  const getAnswerButtonClass = (index: number) => {
    if (!showResult) return '';
    
    if (index === currentQuestion.correctAnswer) {
      return 'bg-green-500 text-white';
    }
    
    if (index === selectedAnswer && index !== currentQuestion.correctAnswer) {
      return 'bg-red-500 text-white';
    }
    
    return 'opacity-50';
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Eye className="h-6 w-6 text-orange-500" />
          Flash Interrogation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {!gameStarted ? (
          <div className="text-center space-y-4">
            <p>Rispondi rapidamente alle domande prima che scada il tempo!</p>
            <Button onClick={startGame} className="w-full">
              Inizia Interrogatorio
            </Button>
          </div>
        ) : (
          <>
            {!isGameComplete && (
              <>
                <div className="flex justify-between items-center">
                  <Badge variant="outline">
                    Domanda {currentQuestionIndex + 1}/{questions.length}
                  </Badge>
                  <Badge 
                    variant={timeLeft <= 2 ? "destructive" : "outline"}
                    className="flex items-center gap-1"
                  >
                    <Clock className="h-3 w-3" />
                    {timeLeft}s
                  </Badge>
                </div>

                <div className="bg-blue-50 p-4 rounded">
                  <h3 className="font-semibold text-center">
                    {currentQuestion.question}
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {currentQuestion.options.map((option, index) => (
                    <Button
                      key={index}
                      onClick={() => selectAnswer(index)}
                      disabled={selectedAnswer !== null || showResult}
                      variant="outline"
                      className={`text-left justify-start ${getAnswerButtonClass(index)}`}
                    >
                      {String.fromCharCode(65 + index)}) {option}
                    </Button>
                  ))}
                </div>

                <div className="text-center">
                  <Badge variant="secondary">
                    Corrette: {correctAnswers}
                  </Badge>
                </div>
              </>
            )}

            {isGameComplete && (
              <div className="text-center space-y-4">
                <h3 className="text-xl font-bold">Interrogatorio Completato!</h3>
                <div className="space-y-2">
                  <p>Risposte corrette: <span className="font-bold">{correctAnswers}/{questions.length}</span></p>
                  <p>Accuratezza: <span className="font-bold">{Math.round((correctAnswers / questions.length) * 100)}%</span></p>
                </div>
                <Button onClick={resetGame} className="w-full">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Nuovo Interrogatorio
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default FlashInterrogationGame;
