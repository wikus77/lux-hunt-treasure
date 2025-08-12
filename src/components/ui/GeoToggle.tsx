import React from 'react';

export const GeoToggle: React.FC<{enabled:boolean; onChange:(v:boolean)=>void}> = ({ enabled, onChange }) => {
  return (
    <button
      type="button"
      aria-pressed={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
        enabled ? 'bg-cyan-500' : 'bg-gray-600'
      }`}
    >
      <span className={`inline-block h-6 w-6 transform rounded-full bg-white shadow transition ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  );
};
