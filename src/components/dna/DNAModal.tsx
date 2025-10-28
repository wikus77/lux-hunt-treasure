// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { DNA_QUESTIONS, ARCHETYPE_CONFIGS, calculateArchetype, getDefaultScores } from '@/features/dna/dnaTypes';
import type { DNAScores } from '@/features/dna/dnaTypes';

interface DNAModalProps {
  isOpen: boolean;
  onComplete: (scores: DNAScores) => void;
  onSkip: () => void;
}

export const DNAModal: React.FC<DNAModalProps> = ({ isOpen, onComplete, onSkip }) => {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  
  const currentQuestion = DNA_QUESTIONS[step];
  const isLastQuestion = step === DNA_QUESTIONS.length - 1;
  const progress = ((step + 1) / DNA_QUESTIONS.length) * 100;

  // Calculate current scores based on answers
  const getCurrentScores = (): DNAScores => {
    const scores = getDefaultScores();
    Object.entries(answers).forEach(([questionId, value]) => {
      const question = DNA_QUESTIONS.find(q => q.id === questionId);
      if (question) {
        scores[question.attribute] = value;
      }
    });
    return scores;
  };

  const currentScores = getCurrentScores();
  const currentArchetype = calculateArchetype(currentScores);
  const archetypeConfig = ARCHETYPE_CONFIGS[currentArchetype];

  const handleAnswer = (value: number) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    if (isLastQuestion) {
      // Calculate final scores
      const finalScores = getDefaultScores();
      DNA_QUESTIONS.forEach(q => {
        if (newAnswers[q.id] !== undefined) {
          finalScores[q.attribute] = newAnswers[q.id];
        }
      });
      
      // Complete onboarding
      setTimeout(() => {
        onComplete(finalScores);
      }, 300);
    } else {
      // Move to next question
      setTimeout(() => {
        setStep(step + 1);
      }, 300);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-2xl bg-black/95 border-2 border-cyan-500/30 backdrop-blur-xl"
      >
        <DialogHeader>
          <DialogTitle className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                M1SSION DNA™
              </div>
              <div className="text-sm text-white/60 font-normal">
                Identità Evolutiva dell'Agente
              </div>
            </motion.div>
          </DialogTitle>
        </DialogHeader>

        {/* Progress bar */}
        <div className="space-y-2">
          <Progress value={progress} className="h-2 bg-white/10" />
          <div className="text-xs text-white/50 text-center">
            Domanda {step + 1} di {DNA_QUESTIONS.length}
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6 py-4"
          >
            {/* Question text */}
            <div className="text-center">
              <div className="text-lg text-white/90 font-medium mb-2">
                {currentQuestion.question}
              </div>
              <Badge variant="outline" className="text-xs text-cyan-400 border-cyan-400/30">
                {currentQuestion.attribute.toUpperCase()}
              </Badge>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => handleAnswer(option.value)}
                  className="w-full p-4 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-400/50 hover:bg-cyan-500/10 transition-all text-left group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="text-white/80 group-hover:text-white transition-colors">
                    {option.label}
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Live archetype preview */}
        {Object.keys(answers).length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 p-4 rounded-lg bg-gradient-to-r from-black/40 to-black/20 border border-white/10"
          >
            <div className="text-xs text-white/50 mb-2 text-center">
              Preview Archetipo
            </div>
            <div className="flex items-center justify-center gap-3">
              <div className="text-3xl">{archetypeConfig.icon}</div>
              <div>
                <div className="text-sm font-bold text-white">
                  {archetypeConfig.nameIt}
                </div>
                <div className="text-xs text-white/60">
                  {archetypeConfig.name}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button
            variant="outline"
            onClick={handleSkip}
            className="flex-1 border-white/20 hover:bg-white/10"
          >
            Più tardi
          </Button>
        </div>

        {/* Neon glow effect */}
        <div className="absolute inset-0 rounded-lg pointer-events-none">
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-600/20 opacity-0 animate-pulse" />
        </div>
      </DialogContent>
    </Dialog>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
