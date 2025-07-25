// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

export const SafeAreaToggle: React.FC = () => {
  const [visible, setVisible] = useState(false);

  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <>
      {isDevelopment && (
        <Button
          size="sm"
          variant="outline"
          className="fixed bottom-4 left-4 z-[9999] bg-black/50 border-white/20 text-white hover:bg-white/10"
          onClick={() => setVisible(!visible)}
        >
          {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span className="ml-2 text-xs">
            {visible ? 'Hide' : 'Show'} Safe Area
          </span>
        </Button>
      )}
    </>
  );
};