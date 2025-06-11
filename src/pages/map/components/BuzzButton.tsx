import React from 'react';
import { motion } from 'framer-motion';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuthContext } from '@/contexts/auth';

interface BuzzButtonProps {
  onPress: () => void;
  canPress: boolean;
  buzzCount: number;
}

const BuzzButton: React.FC<BuzzButtonProps> = ({ onPress, canPress, buzzCount }) => {
  const { isAuthenticated } = useAuthContext();

  return (
    <motion.div
      className="fixed bottom-20 right-4 z-50"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Button
        onClick={onPress}
        disabled={!canPress}
        className="relative rounded-full w-20 h-20 flex items-center justify-center bg-projectx-blue text-black shadow-md hover:bg-blue-600 transition-colors"
      >
        <Zap className="h-8 w-8" />
        <span className="absolute bottom-1 text-xs text-white">{buzzCount}</span>
      </Button>
    </motion.div>
  );
};

export default BuzzButton;
