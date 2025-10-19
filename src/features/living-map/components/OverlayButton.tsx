import React from 'react';

export interface OverlayButtonProps {
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
  variant?: 'pill' | 'round';
}

const OverlayButton: React.FC<OverlayButtonProps> = ({
  label,
  icon,
  active = false,
  disabled = false,
  onClick,
  className = '',
  variant = 'pill'
}) => {
  const baseStyles = variant === 'round' 
    ? 'w-9 h-9 rounded-full flex items-center justify-center'
    : 'px-3 py-1.5 rounded-2xl inline-flex items-center gap-2';

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`living-hud-glass pointer-events-auto transition-all duration-300 ${baseStyles} ${className}`}
      style={{
        opacity: disabled ? 0.6 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: active
          ? '0 0 24px rgba(0, 229, 255, 0.6), 0 0 12px rgba(138, 43, 226, 0.4)'
          : 'var(--living-map-glow)',
        borderColor: active ? 'var(--living-map-neon-primary)' : 'var(--living-map-stroke)',
        color: active ? 'var(--living-map-neon-primary)' : 'var(--living-map-text-primary)',
        fontSize: '13px',
        fontWeight: 600,
        letterSpacing: '0.5px',
        textTransform: 'uppercase'
      }}
      aria-label={label}
      aria-pressed={active}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {variant === 'pill' && <span>{label}</span>}
    </button>
  );
};

export default OverlayButton;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
