
import React from 'react';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import M1ssionText from '@/components/logo/M1ssionText';

const MapPageHeader: React.FC = () => {
  return (
    <UnifiedHeader
      leftComponent={
        <div className="flex items-center">
          <M1ssionText />
        </div>
      }
    />
  );
};

export default MapPageHeader;
