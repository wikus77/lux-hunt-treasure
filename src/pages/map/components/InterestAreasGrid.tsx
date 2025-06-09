
import React from 'react';
import InterestAreasCounter from '../InterestAreasCounter';
import InterestAreasDetails from '../InterestAreasDetails';

const InterestAreasGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Left container: Counter - Aree di interesse (0) */}
      <div className="relative rounded-2xl shadow-md border border-white/10 bg-gradient-to-tr from-[#1c1e27] via-[#1e1f2b] to-[#14151d] px-6 py-5 text-white font-sans text-base tracking-wide overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#00cfff] via-[#ff00cc] to-[#ffa800]"></div>
        <InterestAreasCounter />
      </div>
      
      {/* Right container: Details - Aree di interesse */}
      <div className="relative rounded-2xl shadow-md border border-white/10 bg-gradient-to-tr from-[#1c1e27] via-[#1e1f2b] to-[#14151d] px-6 py-5 text-white font-sans text-base tracking-wide overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#00cfff] via-[#ff00cc] to-[#ffa800]"></div>
        <InterestAreasDetails />
      </div>
    </div>
  );
};

export default InterestAreasGrid;
