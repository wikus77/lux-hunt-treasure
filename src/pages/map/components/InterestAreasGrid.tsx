
import React from 'react';
import InterestAreasCounter from '../InterestAreasCounter';
import InterestAreasDetails from '../InterestAreasDetails';

const InterestAreasGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left container: Counter */}
      <div className="m1ssion-glass-card p-4 sm:p-6 rounded-[24px]">
        <InterestAreasCounter />
      </div>
      
      {/* Right container: Details */}
      <div className="m1ssion-glass-card p-4 sm:p-6 rounded-[24px]">
        <InterestAreasDetails />
      </div>
    </div>
  );
};

export default InterestAreasGrid;
