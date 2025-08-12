import React from 'react';
export const GeoToggle: React.FC<{enabled:boolean; onChange:(v:boolean)=>void;}> =
({enabled,onChange}) => (
  <button
    onClick={() => onChange(!enabled)}
    aria-pressed={enabled}
    className={`relative inline-flex h-7 w-12 items-center rounded-full transition
      ${enabled ? 'bg-cyan-500' : 'bg-zinc-600'}`}
  >
    <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition
      ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);
