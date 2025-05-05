
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Save } from "lucide-react";

interface ProfileHeaderProps {
  agentCode: string;
  agentTitle: string;
  isEditing: boolean;
  onEditToggle: () => void;
  onSave: () => void;
}

const ProfileHeader = ({ 
  agentCode, 
  agentTitle, 
  isEditing, 
  onEditToggle, 
  onSave 
}: ProfileHeaderProps) => {
  return (
    <div className="p-4 border-b border-gray-800 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <span className="text-cyan-400 font-mono">DOSSIER AGENTE:</span>
        <span className="font-mono text-white bg-cyan-900/30 px-2 py-1 rounded">{agentCode}</span>
        {!isEditing && <span className="bg-cyan-600 text-white text-xs px-2 py-0.5 rounded-full">{agentTitle}</span>}
      </div>
      
      <Button
        onClick={() => isEditing ? onSave() : onEditToggle()}
        size="sm"
        className="bg-cyan-800 hover:bg-cyan-700"
      >
        {isEditing ? <Save className="h-4 w-4 mr-1" /> : <Edit className="h-4 w-4 mr-1" />}
        {isEditing ? "Salva" : "Modifica"}
      </Button>
    </div>
  );
};

export default ProfileHeader;
