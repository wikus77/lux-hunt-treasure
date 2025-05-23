
import React from 'react';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import M1ssionText from '@/components/logo/M1ssionText';

const MapPageHeader: React.FC = () => {
  return (
    <UnifiedHeader
      leftComponent={<M1ssionText />}
    />
  );
};

export default MapPageHeader;
