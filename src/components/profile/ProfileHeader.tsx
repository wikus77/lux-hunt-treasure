
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Save } from "lucide-react";
import { motion } from "framer-motion";

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
  const [showCodeText, setShowCodeText] = useState(false);

  useEffect(() => {
    // Typewriter effect for agent dossier
    const timer = setTimeout(() => {
      setShowCodeText(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="p-4 border-b border-gray-800 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex items-center"
        >
          <span className="text-cyan-400 font-mono text-xs sm:text-sm">DOSSIER AGENTE:</span>
          <motion.span 
            className="font-mono text-white bg-cyan-900/30 px-2 py-1 rounded text-xs sm:text-sm ml-2"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "auto", opacity: showCodeText ? 1 : 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {agentCode}
          </motion.span>
        </motion.div>
        
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
