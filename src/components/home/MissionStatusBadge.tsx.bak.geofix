// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { motion } from 'framer-motion';
import { useActiveMissionEnrollment } from '@/hooks/useActiveMissionEnrollment';

export const MissionStatusBadge = () => {
  const { isEnrolled, isLoading } = useActiveMissionEnrollment();

  if (isLoading || !isEnrolled) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-[#00D1FF]/10 border border-[#00D1FF]/30"
    >
      <span className="text-xs font-orbitron font-semibold text-[#00D1FF] uppercase tracking-wider">
        ON M1SSION
      </span>
    </motion.div>
  );
};
