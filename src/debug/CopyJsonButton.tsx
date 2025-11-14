/**
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Copy JSON Button Component
 */

import React from 'react';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';

interface CopyJsonButtonProps {
  data: any;
  label?: string;
}

export const CopyJsonButton: React.FC<CopyJsonButtonProps> = ({ data, label = 'Copy' }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    try {
      const json = JSON.stringify(data, null, 2);
      navigator.clipboard.writeText(json);
      setCopied(true);
      toast.success('JSON copiato negli appunti');
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      toast.error('Errore nella copia');
      console.error('Copy error:', e);
    }
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        padding: '4px 8px',
        fontSize: '11px',
        backgroundColor: copied ? '#10b981' : '#3b82f6',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {label}
    </button>
  );
};

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
