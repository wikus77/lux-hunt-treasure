/**
 * Safe Select Component - Crash-proof native select for TRON BATTLE
 * Uses native HTML select to avoid portal/overlay issues in preview environments
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React from 'react';
import { StakeType, STAKE_TYPES } from '@/lib/battle/constants';

interface SafeSelectProps {
  value: StakeType;
  onChange: (value: StakeType) => void;
  disabled?: boolean;
  className?: string;
}

export function SafeSelect({ value, onChange, disabled, className = '' }: SafeSelectProps) {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value as StakeType;
    
    // Validate before calling onChange
    if (STAKE_TYPES.some(t => t.value === selectedValue)) {
      onChange(selectedValue);
    } else {
      console.warn('⚠️ Invalid stake type value:', selectedValue);
    }
  };

  return (
    <select
      aria-label="Stake Type"
      value={value}
      onChange={handleChange}
      disabled={disabled}
      className={`w-full rounded-lg bg-gray-700 border border-cyan-500/30 text-white px-3 py-2.5 
        focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50
        disabled:opacity-50 disabled:cursor-not-allowed
        hover:border-cyan-500/50 transition-colors
        cursor-pointer ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
        backgroundPosition: 'right 0.5rem center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: '1.5em 1.5em',
        paddingRight: '2.5rem',
      }}
    >
      {STAKE_TYPES.map((type) => (
        <option key={type.value} value={type.value}>
          {type.icon} {type.label}
        </option>
      ))}
    </select>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
