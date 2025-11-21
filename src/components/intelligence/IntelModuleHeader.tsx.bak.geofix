// © 2025 Joseph MULÉ – M1SSION™ - Intel Module Header (exclusive render)
import React from 'react';
import { X, Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocation } from 'wouter';

interface IntelModuleHeaderProps {
  title: string;
}

const IntelModuleHeader: React.FC<IntelModuleHeaderProps> = ({ title }) => {
  const [, setLocation] = useLocation();

  return (
    <div className="sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-md border-b border-border">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLocation('/intelligence/final-shot')}
          aria-label="Apri Final Shot"
        >
          <Crosshair className="w-4 h-4 mr-2" /> FINAL SHOT
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setLocation('/intelligence')}
          aria-label="Chiudi e torna alla lista Intelligence"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default IntelModuleHeader;
