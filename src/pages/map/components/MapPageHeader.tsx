
import React from 'react';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const MapPageHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-black/50 to-[#131524]/50 backdrop-blur-xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate(-1)}
        className="text-white hover:bg-white/10"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Indietro
      </Button>
      
      <h1 className="text-xl font-bold text-white">BUZZ MAPPA</h1>
      
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
