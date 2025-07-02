
import React from 'react';
import { Card } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const NotesSection: React.FC = () => {
  return (
    <Card className="bg-gray-900/50 border-gray-700/50 p-4">
      <div className="flex items-center gap-2 mb-3">
        <FileText className="w-4 h-4 text-cyan-400" />
        <h3 className="text-white font-medium">Note Missione</h3>
      </div>
      <div className="text-gray-300 text-sm space-y-2">
        <p>• Usa BUZZ per ridurre l'area di ricerca</p>
        <p>• Aggiungi punti sulla mappa per salvare posizioni</p>
        <p>• Le aree azzurre indicano zone BUZZ attive</p>
      </div>
    </Card>
  );
};

export default NotesSection;
