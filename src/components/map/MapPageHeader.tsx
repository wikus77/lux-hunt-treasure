
import React from 'react';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import M1ssionText from '@/components/logo/M1ssionText';

const MapPageHeader: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 pt-safe-top">
      <UnifiedHeader leftComponent={<M1ssionText />} />
    </div>
  );
};

export default MapPageHeader;
