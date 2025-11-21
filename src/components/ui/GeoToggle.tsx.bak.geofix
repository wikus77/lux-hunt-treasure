// © M1SSION™
import React from 'react';

export const GeoToggle: React.FC<{enabled:boolean; onChange:(v:boolean)=>void}> = ({enabled,onChange}) => {
  return (
    <button
      aria-label="Geolocalizzazione"
      onClick={()=>onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition
        ${enabled ? 'bg-cyan-400' : 'bg-neutral-500/70'}`}
      style={{boxShadow: enabled ? '0 0 16px rgba(34,211,238,.6)' : 'none'}}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition
        ${enabled ? 'translate-x-5' : 'translate-x-1'}`}
      />
    </button>
  );
};
