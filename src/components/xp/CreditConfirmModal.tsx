// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Zap, MapPin, CheckCircle, Sparkles } from 'lucide-react';

interface CreditConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creditType: 'buzz' | 'buzz_map' | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export const CreditConfirmModal: React.FC<CreditConfirmModalProps> = ({
  open,
  onOpenChange,
  creditType,
  onConfirm,
  onCancel
}) => {
  const creditInfo = {
    buzz: {
      icon: Zap,
      title: 'Buzz Gratuito',
      description: 'Utilizzare un Buzz gratuito ottenuto tramite XP?',
      color: 'purple',
      gradientFrom: 'from-purple-900/40',
      gradientTo: 'to-purple-700/40',
      borderColor: 'border-purple-500/30',
      textColor: 'text-purple-200',
      buttonBg: 'bg-purple-600/20',
      buttonBorder: 'border-purple-500/50',
      buttonHover: 'hover:bg-purple-600/40'
    },
    buzz_map: {
      icon: MapPin,
      title: 'Buzz Mappa Gratuito',
      description: 'Utilizzare un Buzz Mappa gratuito ottenuto tramite XP?',
      color: 'cyan',
      gradientFrom: 'from-cyan-900/40',
      gradientTo: 'to-cyan-700/40',
      borderColor: 'border-cyan-500/30',
      textColor: 'text-cyan-200',
      buttonBg: 'bg-cyan-600/20',
      buttonBorder: 'border-cyan-500/50',
      buttonHover: 'hover:bg-cyan-600/40'
    }
  };

  const currentCredit = creditType ? creditInfo[creditType] : null;

  if (!currentCredit) return null;

  const Icon = currentCredit.icon;

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm mx-auto bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f172a] border border-cyan-500/20">
        <DialogHeader className="text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center mb-4"
          >
            <div className="relative">
              <div className={`p-4 bg-gradient-to-r ${currentCredit.gradientFrom} ${currentCredit.gradientTo} rounded-full border ${currentCredit.borderColor}`}>
                <Icon className="w-12 h-12 text-white" />
              </div>
              <motion.div
                animate={{ 
                  scale: [1, 1.3, 1],
                  rotate: [0, 180, 360] 
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "loop" 
                }}
                className="absolute -top-1 -right-1"
              >
                <Sparkles className="w-6 h-6 text-yellow-400" />
              </motion.div>
            </div>
          </motion.div>
          
          <DialogTitle className="text-xl font-bold gradient-text mb-2">
            🎁 {currentCredit.title}
          </DialogTitle>
          
          <p className="text-gray-300 text-sm">
            {currentCredit.description}
          </p>
        </DialogHeader>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className={`p-4 bg-gradient-to-r ${currentCredit.gradientFrom} ${currentCredit.gradientTo} rounded-lg border ${currentCredit.borderColor} mb-4`}
        >
          <div className="flex items-center space-x-3">
            <div className={`p-2 ${currentCredit.buttonBg} rounded-full`}>
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className={`font-semibold ${currentCredit.textColor}`}>Credito XP</p>
              <p className="text-sm text-gray-400">Ottenuto tramite sistema XP</p>
            </div>
          </div>
        </motion.div>

        <div className="flex space-x-3">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="flex-1 bg-gray-700/50 border-gray-600/50 text-gray-300 hover:bg-gray-700/80"
          >
            Annulla
          </Button>
          <Button
            onClick={handleConfirm}
            className={`flex-1 ${currentCredit.buttonBg} ${currentCredit.buttonBorder} ${currentCredit.textColor} ${currentCredit.buttonHover} border`}
          >
            Conferma
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};