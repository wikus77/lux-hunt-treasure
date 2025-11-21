// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Next Best Action Pills - Contextual suggestions

import React from 'react';

export interface NBASuggestion {
  label: string;
  payload: string;
}

interface NBAPillsProps {
  suggestions: NBASuggestion[];
  onPick: (payload: string) => void;
}

export const NBAPills: React.FC<NBAPillsProps> = ({ suggestions, onPick }) => {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2 flex-wrap pt-2 pb-3">
      {suggestions.slice(0, 3).map((s, i) => (
        <button
          key={i}
          className="rounded-full px-4 py-2 text-sm bg-gradient-to-r from-[#F213A4]/20 to-[#0EA5E9]/20 border border-[#F213A4]/30 hover:from-[#F213A4]/30 hover:to-[#0EA5E9]/30 text-white transition-all hover:scale-105 press-effect"
          onClick={() => onPick(s.payload)}
        >
          💡 {s.label}
        </button>
      ))}
    </div>
  );
};
