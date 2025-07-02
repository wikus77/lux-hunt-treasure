
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MapPageHeader: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between p-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/')}
        className="text-white hover:bg-white/10"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Indietro
      </Button>
      
      <h1 className="text-white font-bold text-lg">Mappa M1SSION</h1>
      
      <Button
        variant="ghost"
        size="sm"
        className="text-white hover:bg-white/10"
      >
        <HelpCircle className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default MapPageHeader;
