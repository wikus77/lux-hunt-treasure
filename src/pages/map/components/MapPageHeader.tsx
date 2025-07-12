
// ✅ Fix UI eseguito da JOSEPH MULE — M1SSION™
import React from 'react';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const MapPageHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between p-4 backdrop-blur-xl" 
         style={{ background: "linear-gradient(to right, rgba(0, 0, 0, 0.55), rgba(19, 21, 33, 0.55), rgba(0, 0, 0, 0.55))" }}>
      {/* ✅ fix by Lovable AI per Joseph Mulé – M1SSION™ */}
      {/* ✅ Compatibilità Capacitor iOS – testata */}
      
      <div className="w-16"></div> {/* Spacer per bilanciare layout */}
      
      <Button
        variant="ghost"
        size="sm"
        className="text-white hover:bg-white/10"
      >
        <HelpCircle className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default MapPageHeader;
