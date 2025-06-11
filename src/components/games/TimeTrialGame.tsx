
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Trophy, RotateCcw } from "lucide-react";
import { toast } from 'sonner';

interface Question {
  question: string;
  options: string[];
  correct: number;
  points: number;
}

const QUESTIONS: Question[] = [
  {
    question: "In che anno fu fondata Roma secondo la tradizione?",
    options: ["753 a.C.", "509 a.C.", "44 a.C.", "27 a.C."],
    correct: 0,
    points: 50
  },
  {
    question: "Chi era l'imperatore durante l'incendio di Roma del 64 d.C.?",
    options: ["Cesare", "Nerone", "Augusto", "Traiano"],
    correct: 1,
    points: 75
  },
  {
    question: "Quale struttura romana poteva contenere fino a 50.000 spettatori?",
    options: ["Circo Massimo", "Colosseo", "Teatro di Marcello", "Terme di Caracalla"],
    correct: 0,
    points: 100
  },
  {
    question: "Come si chiamava la via commerciale che collegava Roma alla Cina?",
    options: ["Via Appia", "Via Flaminia", "Via della Seta", "Via Salaria"],
    correct: 2,
    points: 125
  },
  {
    question: "Quale fiume attraversa Roma?",
    options: ["Arno", "Po", "Tevere", "Adige"],
    correct: 2,
    points: 50
  },
  {
    question: "In che anno cadde l'Impero Romano d'Occidente?",
    options: ["410 d.C.", "455 d.C.", "476 d.C.", "493 d.C."],
    correct: 2,
    points: 150
  }
];

const TimeTrialGame: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<number[]>([]);
  const [streak, setStreak] = useState(0);

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setTimeLeft(60);
    setCurrentQuestion(0);
    setAnsweredQuestions([]);
    setGameCompleted(false);
    setStreak(0);
  };

  const resetGame = () => {
    setGameStarted(false);
    setScore(0);
    setTimeLeft(60);
    setCurrentQuestion(0);
    setAnsweredQuestions([]);
    setGameCompleted(false);
    setStreak(0);
  };

  useEffect(() => {
    if (gameStarted && !gameCompleted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
    
    if (timeLeft === 0 && !gameCompleted) {
      setGameCompleted(true);
      toast.success(`Tempo scaduto! Punteggio finale: ${score}`);
    }
  }, [gameStarted, gameCompleted, timeLeft, score]);

  const handleAnswer = (answerIndex: number) => {
    const question = QUESTIONS[currentQuestion];
    const isCorrect = answerIndex === question.correct;
    
    if (isCorrect) {
      const basePoints = question.points;
      const timeBonus = Math.floor(timeLeft / 10) * 5;
      const streakBonus = streak * 10;
      const totalPoints = basePoints + timeBonus + streakBonus;
      
      setScore(score + totalPoints);
      setStreak(streak + 1);
      toast.success(`Corretto! +${totalPoints} punti (Streak: ${streak + 1})`);
    } else {
      setStreak(0);
      toast.error('Risposta errata!');
    }
    
    setAnsweredQuestions(prev => [...prev, currentQuestion]);
    
    // Move to next question or complete game
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setGameCompleted(true);
      const finalScore = score + (isCorrect ? question.points + Math.floor(timeLeft / 10) * 5 + streak * 10 : 0);
      setScore(finalScore);
      toast.success(`Complimenti! Tutte le domande completate! Punteggio finale: ${finalScore}`);
    }
  };

  if (!gameStarted) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-white flex items-center justify-center gap-2">
            <Clock className="w-6 h-6 text-green-400" />
            Corsa Contro il Tempo
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-300">
            Rispondi alle domande Mission in tempo limitato!
          </p>
          <div className="space-y-2 text-sm text-gray-400">
            <p>• Tempo limite: 60 secondi</p>
            <p>• Punti variabili per domanda (50-150)</p>
            <p>• Bonus tempo: +5 punti ogni 10 secondi rimanenti</p>
            <p>• Bonus streak: +10 punti per risposta consecutiva corretta</p>
          </div>
          <Button onClick={startGame} className="w-full">
            <Clock className="w-4 h-4 mr-2" />
            Inizia Corsa
          </Button>
        </CardContent>
      </Card>
    );
  }

  const question = QUESTIONS[currentQuestion];

  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-green-400" />
            Corsa Contro il Tempo
          </CardTitle>
          <Button onClick={resetGame} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-300">Domanda: {currentQuestion + 1}/{QUESTIONS.length}</span>
          <span className="text-red-400">Tempo: {timeLeft}s</span>
          <span className="text-yellow-400">Punteggio: {score}</span>
          {streak > 0 && <span className="text-green-400">Streak: {streak}</span>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-lg font-bold text-white mb-4">
              {question.question}
            </h3>
            <div className="text-sm text-gray-400 mb-4">
              Punti: {question.points} • Bonus tempo disponibile: {Math.floor(timeLeft / 10) * 5}
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-3">
            {question.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleAnswer(index)}
                variant="outline"
                className="h-auto p-4 text-left justify-start bg-gray-800 border-gray-600 hover:bg-gray-700"
                disabled={gameCompleted}
              >
                <span className="font-bold mr-3 text-blue-400">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
              </Button>
            ))}
          </div>
          
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-red-500 h-2 rounded-full transition-all duration-1000"
              style={{ width: `${(timeLeft / 60) * 100}%` }}
            />
          </div>
          
          {gameCompleted && (
            <div className="text-center space-y-2 p-4 bg-green-900/30 rounded-lg border border-green-400">
              <Trophy className="w-8 h-8 text-yellow-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Mission Completata!</h3>
              <p className="text-green-400">Punteggio finale: {score}</p>
              <p className="text-sm text-gray-300">
                Hai risposto a {answeredQuestions.length} domande!
              </p>
              <Button onClick={resetGame} className="mt-2">
                Gioca di nuovo
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeTrialGame;
