// ✅ Fix UI chirurgico firmato esclusivamente BY JOSEPH MULE — M1SSION™
import React from 'react';
import { Spinner } from '@/components/ui/spinner';

const MapLoadingFallback = () => (
  <div className="h-96 bg-gray-900/50 rounded-lg flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Spinner size="lg" className="text-[#00D1FF]" />
      <p className="text-gray-400">Caricamento mappa...</p>
    </div>
  </div>
);

export default MapLoadingFallback;