
// FILE CREATO O MODIFICATO — BY JOSEPH MULE
import React from 'react';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import M1ssionText from '@/components/logo/M1ssionText';
import { motion } from 'framer-motion';
import { useScrollDirection } from '@/hooks/useScrollDirection';
import MinimalHeaderStrip from '@/components/layout/MinimalHeaderStrip';
import AgentBadge from '@/components/AgentBadge';

const MapPageHeader: React.FC = () => {
  const { shouldHideHeader } = useScrollDirection(50);
  
  return (
    <>
      <MinimalHeaderStrip show={shouldHideHeader}>
        <AgentBadge />
      </MinimalHeaderStrip>
      <motion.div
        animate={{ 
          y: shouldHideHeader ? -100 : 0,
          opacity: shouldHideHeader ? 0 : 1 
        }}
        transition={{ 
          duration: 0.3, 
          ease: [0.4, 0, 0.2, 1] 
        }}
      >
        <UnifiedHeader leftComponent={<M1ssionText />} />
      </motion.div>
    </>
  );
};

export default MapPageHeader;
