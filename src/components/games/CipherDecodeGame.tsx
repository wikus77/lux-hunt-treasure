
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, Trophy, RotateCcw } from "lucide-react";
import { toast } from 'sonner';

const CIPHER_PAIRS = [
  { roman: 'AVE CAESAR', decoded: 'SALVE IMPERATORE', hint: 'Saluto romano classico' },
  { roman: 'SPQR', decoded: 'SENATUS POPULUSQUE ROMANUS', hint: 'Emblema della Repubblica' },
  { roman: 'VENI VIDI VICI', decoded: 'VENNI VIDI VINSI', hint: 'Famosa frase di Cesare' },
  { roman: 'CARPE DIEM', decoded: 'COGLI LATTIMO', hint: 'Filosofia epicurea' },
  { roman: 'ALEA IACTA EST', decoded: 'IL DADO E TRATTO', hint: 'Al Rubicone' }
];

const CipherDecodeGame: React.FC = () => {
  const [currentCipher, setCurrentCipher] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [solvedCiphers, setSolvedCiphers] = useState<number[]>([]);

  const startGame = () => {
    setGameStarted(true);
    setScore(0);
    setTimeLeft(120);
    setSolvedCiphers([]);
    setCurrentCipher(0);
    setUserInput('');
    setGameCompleted(false);
  };

  const resetGame = () => {
    setGameStarted(false);
    setScore(0);
    setTimeLeft(120);
    setSolvedCiphers([]);
    setCurrentCipher(0);
    setUserInput('');
    setGameCompleted(false);
  };

  useEffect(() => {
    if (gameStarted && !gameCompleted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
    
    if (timeLeft === 0 && !gameCompleted) {
      toast.error('Tempo scaduto! Hai decodificato ' + solvedCiphers.length + ' cifrari.');
      setGameStarted(false);
    }
  }, [gameStarted, gameCompleted, timeLeft, solvedCiphers.length]);

  const checkAnswer = () => {
    const currentPair = CIPHER_PAIRS[currentCipher];
    const normalizedInput = userInput.trim().toUpperCase().replace(/[^A-Z\s]/g, '');
    const normalizedAnswer = currentPair.decoded.toUpperCase().replace(/[^A-Z\s]/g, '');
    
    if (normalizedInput === normalizedAnswer) {
      const points = Math.max(100, 200 - (120 - timeLeft) * 2);
      setScore(score + points);
      setSolvedCiphers(prev => [...prev, currentCipher]);
      toast.success(`Corretto! +${points} punti`);
      
      if (currentCipher < CIPHER_PAIRS.length - 1) {
        setCurrentCipher(currentCipher + 1);
        setUserInput('');
      } else {
        setGameCompleted(true);
        const timeBonus = timeLeft * 5;
        const finalScore = score + points + timeBonus;
        setScore(finalScore);
        toast.success(`Complimenti! Tutti i cifrari decodificati! Punteggio finale: ${finalScore}`);
      }
    } else {
      toast.error('Risposta errata. Riprova!');
      setUserInput('');
    }
  };

  const skipCipher = () => {
    if (currentCipher < CIPHER_PAIRS.length - 1) {
      setCurrentCipher(currentCipher + 1);
      setUserInput('');
    }
  };

  if (!gameStarted) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-white flex items-center justify-center gap-2">
            <Lock className="w-6 h-6 text-yellow-400" />
            Decodifica Cipher
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-300">
            Decifra i codici segreti dell'antica Roma!
          </p>
          <div className="space-y-2 text-sm text-gray-400">
            <p>• Tempo limite: 2 minuti</p>
            <p>• Punti base: 200 per risposta corretta</p>
            <p>• Bonus velocità: -2 punti per secondo trascorso</p>
            <p>• Bonus tempo finale: 5 punti per secondo rimanente</p>
          </div>
          <Button onClick={startGame} className="w-full">
            <Lock className="w-4 h-4 mr-2" />
            Inizia Decodifica
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentPair = CIPHER_PAIRS[currentCipher];

  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white flex items-center gap-2">
            <Lock className="w-6 h-6 text-yellow-400" />
            Decodifica Cipher
          </CardTitle>
          <Button onClick={resetGame} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-300">Cifrario: {currentCipher + 1}/{CIPHER_PAIRS.length}</span>
          <span className="text-blue-400">Tempo: {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
          <span className="text-yellow-400">Punteggio: {score}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-white mb-2">Decifra questo messaggio:</h3>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-600">
              <p className="text-2xl font-mono text-yellow-400 tracking-wider">
                {currentPair.roman}
              </p>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              💡 Suggerimento: {currentPair.hint}
            </p>
          </div>
          
          <div className="space-y-4">
            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Inserisci la traduzione..."
              className="bg-gray-800 border-gray-600 text-white"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  checkAnswer();
                }
              }}
            />
            
            <div className="flex gap-2">
              <Button onClick={checkAnswer} className="flex-1" disabled={!userInput.trim()}>
                Verifica Risposta
              </Button>
              <Button onClick={skipCipher} variant="outline" disabled={currentCipher >= CIPHER_PAIRS.length - 1}>
                Salta
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-5 gap-2">
            {CIPHER_PAIRS.map((_, index) => (
              <div
                key={index}
                className={`h-3 rounded ${
                  solvedCiphers.includes(index) 
                    ? 'bg-green-500' 
                    : index === currentCipher 
                      ? 'bg-blue-500' 
                      : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
          
          {gameCompleted && (
            <div className="text-center space-y-2 p-4 bg-green-900/30 rounded-lg border border-green-400">
              <Trophy className="w-8 h-8 text-yellow-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Mission Completata!</h3>
              <p className="text-green-400">Punteggio finale: {score}</p>
              <p className="text-sm text-gray-300">Hai decodificato tutti i cifrari romani!</p>
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

export default CipherDecodeGame;
