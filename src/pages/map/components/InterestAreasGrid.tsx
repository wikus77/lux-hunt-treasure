
import React from 'react';
import InterestAreasCounter from '../InterestAreasCounter';
import InterestAreasDetails from '../InterestAreasDetails';

const InterestAreasGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left container: AREE DI INTERESSE (0) - Counter */}
      <div className="relative rounded-2xl border border-purple-500/20 bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-gray-900/90 backdrop-blur-sm overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500"></div>
        <div className="p-6">
          <InterestAreasCounter />
        </div>
      </div>
      
      {/* Right container: AREE DI INTERESSE - Details */}
      <div className="relative rounded-2xl border border-purple-500/20 bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-gray-900/90 backdrop-blur-sm overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500"></div>
        <div className="p-6">
          <InterestAreasDetails />
        </div>
      </div>
    </div>
  );
};

export default InterestAreasGrid;
