
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, RotateCcw, Trophy } from "lucide-react";
import { toast } from 'sonner';

interface MemoryCard {
  id: number;
  symbol: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const SYMBOLS = ['🔍', '🗝️', '💎', '🏛️', '⚡', '🎯', '🌟', '🔐'];

const MemoryHackGame: React.FC = () => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const initializeGame = () => {
    const shuffledSymbols = [...SYMBOLS, ...SYMBOLS].sort(() => Math.random() - 0.5);
    const newCards = shuffledSymbols.map((symbol, index) => ({
      id: index,
      symbol,
      isFlipped: false,
      isMatched: false
    }));
    
    setCards(newCards);
    setFlippedCards([]);
    setMoves(0);
    setScore(0);
    setGameCompleted(false);
    setTimeLeft(60);
  };

  const startGame = () => {
    initializeGame();
    setGameStarted(true);
  };

  const resetGame = () => {
    setGameStarted(false);
    initializeGame();
  };

  useEffect(() => {
    if (gameStarted && !gameCompleted && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
    
    if (timeLeft === 0 && !gameCompleted) {
      toast.error('Tempo scaduto! Riprova.');
      setGameStarted(false);
    }
  }, [gameStarted, gameCompleted, timeLeft]);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      setMoves(moves + 1);
      
      if (cards[first].symbol === cards[second].symbol) {
        // Match found
        setTimeout(() => {
          setCards(prevCards => 
            prevCards.map(card => 
              card.id === first || card.id === second 
                ? { ...card, isMatched: true, isFlipped: true }
                : card
            )
          );
          setScore(score + 100);
          setFlippedCards([]);
          
          // Check if game is completed
          const updatedCards = cards.map(card => 
            card.id === first || card.id === second 
              ? { ...card, isMatched: true }
              : card
          );
          
          if (updatedCards.every(card => card.isMatched)) {
            setGameCompleted(true);
            const timeBonus = timeLeft * 10;
            const finalScore = score + 100 + timeBonus;
            setScore(finalScore);
            toast.success(`Complimenti! Hai completato il Memory Hack! Punteggio: ${finalScore}`);
          }
        }, 1000);
      } else {
        // No match
        setTimeout(() => {
          setCards(prevCards => 
            prevCards.map(card => 
              card.id === first || card.id === second 
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
        }, 1000);
      }
    }
  }, [flippedCards, cards, moves, score, timeLeft]);

  const handleCardClick = (cardId: number) => {
    if (flippedCards.length === 2 || cards[cardId].isFlipped || cards[cardId].isMatched) {
      return;
    }

    setCards(prevCards => 
      prevCards.map(card => 
        card.id === cardId ? { ...card, isFlipped: true } : card
      )
    );
    
    setFlippedCards(prev => [...prev, cardId]);
  };

  if (!gameStarted) {
    return (
      <Card className="bg-gray-900/50 border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-white flex items-center justify-center gap-2">
            <Brain className="w-6 h-6 text-blue-400" />
            Memory Hack
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-300">
            Trova tutte le coppie di simboli Mission prima che il tempo scada!
          </p>
          <div className="space-y-2 text-sm text-gray-400">
            <p>• Tempo limite: 60 secondi</p>
            <p>• Punti per coppia: 100</p>
            <p>• Bonus tempo: 10 punti per secondo rimanente</p>
          </div>
          <Button onClick={startGame} className="w-full">
            <Brain className="w-4 h-4 mr-2" />
            Inizia Hack Memory
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gray-900/50 border-gray-700">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-400" />
            Memory Hack
          </CardTitle>
          <Button onClick={resetGame} variant="outline" size="sm">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-300">Mosse: {moves}</span>
          <span className="text-blue-400">Tempo: {timeLeft}s</span>
          <span className="text-yellow-400">Punteggio: {score}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {cards.map(card => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className={`
                aspect-square rounded-lg border-2 transition-all duration-300 text-2xl
                ${card.isFlipped || card.isMatched 
                  ? 'bg-blue-500 border-blue-400 text-white' 
                  : 'bg-gray-800 border-gray-600 hover:border-gray-500'
                }
                ${card.isMatched ? 'ring-2 ring-green-400' : ''}
              `}
              disabled={card.isFlipped || card.isMatched || flippedCards.length === 2}
            >
              {card.isFlipped || card.isMatched ? card.symbol : '?'}
            </button>
          ))}
        </div>
        
        {gameCompleted && (
          <div className="text-center space-y-2 p-4 bg-green-900/30 rounded-lg border border-green-400">
            <Trophy className="w-8 h-8 text-yellow-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Mission Completata!</h3>
            <p className="text-green-400">Punteggio finale: {score}</p>
            <Button onClick={resetGame} className="mt-2">
              Gioca di nuovo
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MemoryHackGame;
