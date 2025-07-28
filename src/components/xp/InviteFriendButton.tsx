// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Users, UserPlus, Sparkles } from 'lucide-react';
import { InviteFriendModal } from './InviteFriendModal';

export const InviteFriendButton: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full"
      >
        <Button
          onClick={() => setModalOpen(true)}
          className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl border border-cyan-400/30 shadow-lg"
        >
          <div className="flex items-center justify-center space-x-3">
            <div className="relative">
              <Users className="w-5 h-5" />
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0] 
                }}
                transition={{ 
                  duration: 2,
                  repeat: Infinity,
                  repeatType: "reverse" 
                }}
                className="absolute -top-1 -right-1"
              >
                <Sparkles className="w-3 h-3 text-yellow-300" />
              </motion.div>
            </div>
            <span>Invita un Amico</span>
            <UserPlus className="w-4 h-4 opacity-80" />
          </div>
        </Button>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-xs text-gray-400 mt-2"
        >
          💰 +25 XP per ogni amico che si registra
        </motion.p>
      </motion.div>

      <InviteFriendModal 
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
};