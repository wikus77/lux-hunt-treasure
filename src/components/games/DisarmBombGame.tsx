/**
 * 💣 DisarmBombGame - Gioco Disinnesco Bomba
 * 
 * Gioco dove l'utente deve tagliare i fili nella sequenza corretta
 * per disinnescare una bomba prima che esploda
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Timer, Scissors, AlertTriangle, CheckCircle, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { playSound } from '@/utils/audio';

interface Wire {
  id: string;
  color: string;
  isCut: boolean;
  position: number;
}

interface Instruction {
  text: string;
  hint: string;
}

const DisarmBombGame: React.FC = () => {
  const [wires, setWires] = useState<Wire[]>([]);
  const [correctSequence, setCorrectSequence] = useState<string[]>([]);
  const [cutSequence, setCutSequence] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(90);
  const [isGameComplete, setIsGameComplete] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [instructions, setInstructions] = useState<Instruction[]>([]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [explosion, setExplosion] = useState(false);

  const wireColors = ['red', 'blue', 'yellow', 'green', 'purple', 'orange'];
  const wireColorClasses = {
    red: 'bg-red-500 border-red-400',
    blue: 'bg-blue-500 border-blue-400',
    yellow: 'bg-yellow-500 border-yellow-400',
    green: 'bg-green-500 border-green-400',
    purple: 'bg-purple-500 border-purple-400',
    orange: 'bg-orange-500 border-orange-400'
  };

  // Genera istruzioni criptiche basate sulla sequenza
  const generateInstructions = useCallback((sequence: string[]) => {
    let instructions: Instruction[] = [];
    
    switch (difficulty) {
      case 'easy':
        const firstInstruction: Instruction = {
          text: `Prima taglia il filo ${sequence[0]?.toUpperCase()}`,
          hint: "Inizia sempre con questo colore"
        };
        instructions = [...instructions, firstInstruction];
        if (sequence[1]) {
          const secondInstruction: Instruction = {
            text: `Poi taglia il filo ${sequence[1]?.toUpperCase()}`,
            hint: "Il secondo della sequenza"
          };
          instructions = [...instructions, secondInstruction];
        }
        break;
        
      case 'medium':
        const mediumFirstInstruction: Instruction = {
          text: `Il primo filo è il colore del ${sequence[0] === 'red' ? 'fuoco' : sequence[0] === 'blue' ? 'cielo' : sequence[0] === 'green' ? 'prato' : sequence[0] === 'yellow' ? 'sole' : sequence[0] === 'purple' ? 'tramonto' : 'autunno'}`,
          hint: "Decodifica il colore"
        };
        instructions = [...instructions, mediumFirstInstruction];
        if (sequence[1]) {
          const mediumSecondInstruction: Instruction = {
            text: `Il secondo è ${sequence[1] === 'blue' ? 'freddo come il ghiaccio' : sequence[1] === 'red' ? 'caldo come il fuoco' : sequence[1] === 'green' ? 'naturale come la foresta' : sequence[1] === 'yellow' ? 'brillante come oro' : sequence[1] === 'purple' ? 'regale come un re' : 'vibrante come un tramonto'}`,
            hint: "Trova l'associazione"
          };
          instructions = [...instructions, mediumSecondInstruction];
        }
        break;
        
      case 'hard':
        const hardFirstInstruction: Instruction = {
          text: `RGB(${sequence[0] === 'red' ? '255,0,0' : sequence[0] === 'blue' ? '0,0,255' : sequence[0] === 'green' ? '0,255,0' : sequence[0] === 'yellow' ? '255,255,0' : sequence[0] === 'purple' ? '128,0,128' : '255,165,0'}) → 1°`,
          hint: "Decodifica il codice colore"
        };
        instructions = [...instructions, hardFirstInstruction];
        if (sequence[1]) {
          const hardSecondInstruction: Instruction = {
            text: `Lunghezza d'onda ${sequence[1] === 'red' ? '700nm' : sequence[1] === 'blue' ? '450nm' : sequence[1] === 'green' ? '550nm' : sequence[1] === 'yellow' ? '580nm' : sequence[1] === 'purple' ? '400nm' : '600nm'} → 2°`,
            hint: "Spettro elettromagnetico"
          };
          instructions = [...instructions, hardSecondInstruction];
        }
        break;
    }
    
    return instructions;
  }, [difficulty]);

  // Inizializza il gioco
  const initializeGame = useCallback(() => {
    const wireCount = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 4 : 6;
    const selectedColors = wireColors.slice(0, wireCount);
    
    // Crea i fili
    const gameWires: Wire[] = selectedColors.map((color, index) => ({
      id: `wire-${index}`,
      color,
      isCut: false,
      position: index
    }));
    
    // Genera sequenza corretta (2-3 fili da tagliare)
    const sequenceLength = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 2 : 3;
    const shuffled = [...selectedColors].sort(() => Math.random() - 0.5);
    const sequence = shuffled.slice(0, sequenceLength);
    
    setWires(gameWires);
    setCorrectSequence(sequence);
    setInstructions(generateInstructions(sequence));
    setCutSequence([]);
  }, [difficulty, generateInstructions]);

  // Timer effect
  useEffect(() => {
    if (!gameStarted || isGameComplete || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setExplosion(true);
          setIsGameComplete(true);
          playSound('error');
          return 0;
        }
        if (prev <= 10) {
          playSound('beep'); // Beep degli ultimi 10 secondi
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStarted, isGameComplete, timeLeft]);

  const startGame = (selectedDifficulty: 'easy' | 'medium' | 'hard') => {
    setDifficulty(selectedDifficulty);
    setGameStarted(true);
    setTimeLeft(selectedDifficulty === 'easy' ? 90 : selectedDifficulty === 'medium' ? 75 : 60);
    setIsGameComplete(false);
    setGameWon(false);
    setExplosion(false);
    playSound('start');
  };

  // Effetto per inizializzare il gioco quando cambia la difficoltà
  useEffect(() => {
    if (gameStarted) {
      initializeGame();
    }
  }, [gameStarted, initializeGame]);

  const cutWire = (wireColor: string) => {
    if (isGameComplete) return;

    const newCutSequence = [...cutSequence, wireColor];
    setCutSequence(newCutSequence);

    // Aggiorna lo stato del filo
    setWires(prev => prev.map(wire => 
      wire.color === wireColor ? { ...wire, isCut: true } : wire
    ));

    // Verifica se la sequenza è corretta
    const expectedWire = correctSequence[newCutSequence.length - 1];
    
    if (wireColor !== expectedWire) {
      // Sequenza sbagliata - esplosione immediata
      setExplosion(true);
      setIsGameComplete(true);
      playSound('error');
      return;
    }

    playSound('success');

    // Verifica se ha completato la sequenza corretta
    if (newCutSequence.length === correctSequence.length) {
      setGameWon(true);
      setIsGameComplete(true);
      playSound('victory');
    }
  };

  const resetGame = () => {
    setGameStarted(false);
    setTimeLeft(90);
    setIsGameComplete(false);
    setGameWon(false);
    setExplosion(false);
    setWires([]);
    setCorrectSequence([]);
    setCutSequence([]);
    setInstructions([]);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-black/90 border-red-500/30">
      <CardHeader className="text-center border-b border-red-500/20">
        <CardTitle className="text-2xl font-bold text-red-400 mb-2">
          💣 DISARM THE BOMB
        </CardTitle>
        {gameStarted && (
          <div className="flex justify-center items-center gap-4">
            <div className={`flex items-center gap-1 ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
              <Timer className="h-4 w-4" />
              <span className="text-xl font-mono">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <div className="text-red-400">
              Fili tagliati: {cutSequence.length}/{correctSequence.length}
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="p-6">
        {!gameStarted ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-6"
          >
            <div className="text-white space-y-4">
              <h3 className="text-xl font-bold text-red-400">Scegli Difficoltà</h3>
              <p>Taglia i fili nella sequenza corretta per disinnescare la bomba!</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => startGame('easy')}
                className="bg-green-600 hover:bg-green-700 p-6 h-auto flex flex-col gap-2"
              >
                <div className="text-lg font-bold">🟢 FACILE</div>
                <div className="text-sm">3 fili, 90 secondi</div>
                <div className="text-xs">Istruzioni chiare</div>
              </Button>
              
              <Button 
                onClick={() => startGame('medium')}
                className="bg-yellow-600 hover:bg-yellow-700 p-6 h-auto flex flex-col gap-2"
              >
                <div className="text-lg font-bold">🟡 MEDIO</div>
                <div className="text-sm">4 fili, 75 secondi</div>
                <div className="text-xs">Indizi criptici</div>
              </Button>
              
              <Button 
                onClick={() => startGame('hard')}
                className="bg-red-600 hover:bg-red-700 p-6 h-auto flex flex-col gap-2"
              >
                <div className="text-lg font-bold">🔴 DIFFICILE</div>
                <div className="text-sm">6 fili, 60 secondi</div>
                <div className="text-xs">Codici complessi</div>
              </Button>
            </div>
          </motion.div>
        ) : (
          <>
            {!isGameComplete && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Istruzioni */}
                <div className="bg-black/50 border border-red-500/30 rounded p-4">
                  <h3 className="text-red-400 font-bold mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Istruzioni di Disinnesco
                  </h3>
                  {instructions.map((instruction, index) => (
                    <div key={index} className="mb-2">
                      <div className="text-white font-mono text-sm">
                        {index + 1}. {instruction.text}
                      </div>
                      <div className="text-gray-400 text-xs italic">
                        💡 {instruction.hint}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bomba e fili */}
                <div className="bg-gradient-to-b from-gray-800 to-gray-900 border-2 border-red-500/50 rounded-lg p-6">
                  <div className="text-center mb-4">
                    <div className="text-6xl animate-pulse">💣</div>
                    <div className="text-red-400 font-bold">BOMBA ATTIVA</div>
                  </div>
                  
                  <div className="space-y-3">
                    {wires.map((wire) => (
                      <motion.div
                        key={wire.id}
                        className="flex items-center gap-4"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex-1 relative">
                          <div 
                            className={`h-6 rounded-full border-2 ${wireColorClasses[wire.color as keyof typeof wireColorClasses]} 
                              ${wire.isCut ? 'opacity-30' : 'opacity-100'} transition-all duration-300`}
                          >
                            {wire.isCut && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Scissors className="h-4 w-4 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <Button
                          onClick={() => cutWire(wire.color)}
                          disabled={wire.isCut}
                          variant="destructive"
                          size="sm"
                          className="min-w-20"
                        >
                          {wire.isCut ? 'TAGLIATO' : 'TAGLIA'}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Sequenza tagliata */}
                <div className="text-center">
                  <div className="text-white font-bold mb-2">Sequenza tagliata:</div>
                  <div className="flex justify-center gap-2">
                    {cutSequence.map((color, index) => (
                      <div
                        key={index}
                        className={`w-8 h-8 rounded-full ${wireColorClasses[color as keyof typeof wireColorClasses]}`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Risultati finali */}
            <AnimatePresence>
              {isGameComplete && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center space-y-6"
                >
                  {explosion && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 1.2, 1] }}
                      className="text-8xl"
                    >
                      💥
                    </motion.div>
                  )}
                  
                  <div className={`text-4xl ${gameWon ? 'text-green-400' : 'text-red-400'}`}>
                    {gameWon ? <CheckCircle className="mx-auto mb-4" size={64} /> : <AlertTriangle className="mx-auto mb-4" size={64} />}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white">
                    {gameWon ? '✅ BOMBA DISINNESCATA!' : explosion ? '💥 ESPLOSIONE!' : '⏰ TEMPO SCADUTO!'}
                  </h3>
                  
                  <div className="text-white space-y-2">
                    <p>Sequenza corretta: {correctSequence.map(color => color.toUpperCase()).join(' → ')}</p>
                    <p>Tua sequenza: {cutSequence.map(color => color.toUpperCase()).join(' → ')}</p>
                    <p>Tempo rimasto: {timeLeft} secondi</p>
                  </div>

                  <Button 
                    onClick={resetGame}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-3"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Nuova Bomba
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DisarmBombGame;