/**
 * 🔓 CrackCombinationGame - Gioco Crack della Combinazione
 * 
 * Gioco dove l'utente deve indovinare una combinazione di 6 cifre
 * usando indizi tipo Mastermind con feedback colorato
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Timer, Trophy, RotateCcw, CheckCircle, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playSound } from '@/utils/audio';

interface CombinationAttempt {
  combination: string;
  feedback: Array<'correct' | 'wrong_position' | 'not_present'>;
  timestamp: number;
}

const CrackCombinationGame: React.FC = () => {
  const [targetCombination] = useState(() => 
    Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('')
  );
  const [currentGuess, setCurrentGuess] = useState('');
  const [attempts, setAttempts] = useState<CombinationAttempt[]>([]);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minuti
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [score, setScore] = useState(0);

  // Timer effect
  useEffect(() => {
    if (!gameStarted || isGameComplete || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsGameComplete(true);
          playSound('error');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, isGameComplete, timeLeft]);

  // Genera feedback per un tentativo
  const generateFeedback = useCallback((guess: string): Array<'correct' | 'wrong_position' | 'not_present'> => {
    const feedback: Array<'correct' | 'wrong_position' | 'not_present'> = [];
    const targetArray = targetCombination.split('');
    const guessArray = guess.split('');
    const usedTarget: boolean[] = new Array(6).fill(false);
    const usedGuess: boolean[] = new Array(6).fill(false);

    // Prima passata: trova le posizioni corrette
    for (let i = 0; i < 6; i++) {
      if (guessArray[i] === targetArray[i]) {
        feedback[i] = 'correct';
        usedTarget[i] = true;
        usedGuess[i] = true;
      }
    }

    // Seconda passata: trova le cifre in posizione sbagliata
    for (let i = 0; i < 6; i++) {
      if (usedGuess[i]) continue;

      let foundWrongPosition = false;
      for (let j = 0; j < 6; j++) {
        if (!usedTarget[j] && guessArray[i] === targetArray[j]) {
          feedback[i] = 'wrong_position';
          usedTarget[j] = true;
          foundWrongPosition = true;
          break;
        }
      }

      if (!foundWrongPosition) {
        feedback[i] = 'not_present';
      }
    }

    return feedback;
  }, [targetCombination]);

  const startGame = () => {
    setGameStarted(true);
    setTimeLeft(180);
    setAttempts([]);
    setCurrentGuess('');
    setIsGameComplete(false);
    setGameWon(false);
    setScore(0);
    playSound('start');
  };

  const submitGuess = () => {
    if (currentGuess.length !== 6 || attempts.length >= 10) return;

    const feedback = generateFeedback(currentGuess);
    const newAttempt: CombinationAttempt = {
      combination: currentGuess,
      feedback,
      timestamp: Date.now()
    };

    setAttempts(prev => [...prev, newAttempt]);

    // Verifica se ha vinto
    if (currentGuess === targetCombination) {
      setGameWon(true);
      setIsGameComplete(true);
      const timeBonus = Math.floor(timeLeft / 10);
      const attemptBonus = Math.max(0, (10 - attempts.length) * 100);
      setScore(timeBonus + attemptBonus + 1000);
      playSound('victory');
    } else if (attempts.length >= 9) { // 10° tentativo
      setIsGameComplete(true);
      playSound('error');
    } else {
      playSound('beep');
    }

    setCurrentGuess('');
  };

  const resetGame = () => {
    setGameStarted(false);
    setTimeLeft(180);
    setAttempts([]);
    setCurrentGuess('');
    setIsGameComplete(false);
    setGameWon(false);
    setScore(0);
  };

  const getFeedbackColor = (feedback: 'correct' | 'wrong_position' | 'not_present') => {
    switch (feedback) {
      case 'correct': return 'bg-green-500';
      case 'wrong_position': return 'bg-yellow-500';
      case 'not_present': return 'bg-gray-500';
    }
  };

  const handleInputChange = (value: string) => {
    const numericValue = value.replace(/\D/g, '').slice(0, 6);
    setCurrentGuess(numericValue);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-black/90 border-cyan-500/30">
      <CardHeader className="text-center border-b border-cyan-500/20">
        <CardTitle className="text-2xl font-bold text-cyan-400 mb-2">
          🔓 CRACK THE COMBINATION
        </CardTitle>
        <div className="flex justify-center items-center gap-4">
          <div className="flex items-center gap-1 text-white">
            <Timer className="h-4 w-4" />
            <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
          </div>
          <div className="text-cyan-400">
            Tentativi: {attempts.length}/10
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {!gameStarted ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-6"
          >
            <div className="text-white space-y-4">
              <h3 className="text-xl font-bold text-cyan-400">Obiettivo</h3>
              <p>Indovina la combinazione segreta di 6 cifre in massimo 10 tentativi!</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 border border-green-500/30 rounded">
                  <div className="w-4 h-4 bg-green-500 rounded mx-auto mb-2"></div>
                  <div className="text-green-400 font-bold">Verde</div>
                  <div>Cifra corretta e posizione giusta</div>
                </div>
                <div className="p-3 border border-yellow-500/30 rounded">
                  <div className="w-4 h-4 bg-yellow-500 rounded mx-auto mb-2"></div>
                  <div className="text-yellow-400 font-bold">Giallo</div>
                  <div>Cifra corretta ma posizione sbagliata</div>
                </div>
                <div className="p-3 border border-gray-500/30 rounded">
                  <div className="w-4 h-4 bg-gray-500 rounded mx-auto mb-2"></div>
                  <div className="text-gray-400 font-bold">Grigio</div>
                  <div>Cifra non presente</div>
                </div>
              </div>
            </div>
            
            <Button 
              onClick={startGame}
              className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-8 py-3 text-lg"
            >
              🚀 Inizia Gioco
            </Button>
          </motion.div>
        ) : (
          <>
            {!isGameComplete && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h3 className="text-lg font-bold text-cyan-400 mb-4">
                    Inserisci la tua combinazione:
                  </h3>
                  
                  <div className="flex justify-center gap-2 mb-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-12 h-12 border-2 border-cyan-500/50 rounded flex items-center justify-center text-white text-xl font-bold bg-black/50"
                      >
                        {currentGuess[i] || ''}
                      </div>
                    ))}
                  </div>

                  <Input
                    type="text"
                    value={currentGuess}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="Inserisci 6 cifre"
                    className="w-40 mx-auto text-center text-lg"
                    maxLength={6}
                  />

                  <Button
                    onClick={submitGuess}
                    disabled={currentGuess.length !== 6}
                    className="mt-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                  >
                    Prova Combinazione
                  </Button>
                </div>

                {/* Storico tentativi */}
                <div className="space-y-2">
                  <h4 className="text-cyan-400 font-bold">Tentativi precedenti:</h4>
                  <AnimatePresence>
                    {attempts.map((attempt, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-2 p-2 border border-cyan-500/20 rounded"
                      >
                        <span className="text-white font-mono text-lg">
                          {attempt.combination}
                        </span>
                        <div className="flex gap-1 ml-4">
                          {attempt.feedback.map((feedback, i) => (
                            <div
                              key={i}
                              className={`w-6 h-6 rounded-full ${getFeedbackColor(feedback)}`}
                            />
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {isGameComplete && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <div className={`text-4xl ${gameWon ? 'text-green-400' : 'text-red-400'}`}>
                  {gameWon ? <CheckCircle className="mx-auto mb-4" size={64} /> : <XCircle className="mx-auto mb-4" size={64} />}
                </div>
                
                <h3 className="text-2xl font-bold text-white">
                  {gameWon ? '🎉 COMBINAZIONE CRACKATA!' : '💥 TEMPO SCADUTO!'}
                </h3>
                
                <div className="text-white space-y-2">
                  <p>Combinazione corretta: <span className="font-mono text-cyan-400 text-xl">{targetCombination}</span></p>
                  <p>Tentativi utilizzati: {attempts.length}/10</p>
                  {gameWon && (
                    <div className="flex items-center justify-center gap-2 text-yellow-400">
                      <Trophy className="h-5 w-5" />
                      <span className="font-bold">Score: {score} punti</span>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={resetGame}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Gioca Ancora
                </Button>
              </motion.div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CrackCombinationGame;