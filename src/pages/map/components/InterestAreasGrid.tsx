
import React from 'react';
import InterestAreasCounter from '../InterestAreasCounter';
import InterestAreasDetails from '../InterestAreasDetails';

const InterestAreasGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Left container: AREE DI INTERESSE (0) - Counter - EXACT style as M1SSION CONSOLE */}
      <div className="relative rounded-2xl bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 border border-gray-700/50 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#00cfff] via-[#ff00cc] to-[#7f00ff]"></div>
        <div className="p-6">
          <InterestAreasCounter />
        </div>
      </div>
      
      {/* Right container: AREE DI INTERESSE - Details - EXACT style as M1SSION AGENT */}
      <div className="relative rounded-2xl bg-gradient-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95 border border-gray-700/50 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-[#00cfff] via-[#ff00cc] to-[#7f00ff]"></div>
        <div className="p-6">
          <InterestAreasDetails />
        </div>
      </div>
    </div>
  );
};

export default InterestAreasGrid;
