
import React, { useState } from "react";
import { FileText, Send, Clock, ShoppingBag, Edit3, MessageSquare, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Textarea } from "@/components/ui/textarea";
import { MagneticButton } from "@/components/ui/magnetic-button";

interface DiaryEntry {
  type: string;
  content: string;
  timestamp: string;
}

interface AgentDiaryProps {
  entries: DiaryEntry[];
  purchasedClues: any[];
  onAddNote: (note: string) => void;
}

export function AgentDiary({ entries, purchasedClues, onAddNote }: AgentDiaryProps) {
  const [newNote, setNewNote] = useState("");

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(newNote.trim());
      setNewNote("");
    }
  };

  const getEntryIcon = (type: string) => {
    switch(type) {
      case "purchase":
        return <ShoppingBag size={16} className="text-cyan-400" />;
      case "note":
        return <Edit3 size={16} className="text-purple-400" />;
      case "message":
        return <MessageSquare size={16} className="text-amber-400" />;
      case "info":
        return <Info size={16} className="text-blue-400" />;
      default:
        return <Clock size={16} className="text-gray-400" />;
    }
  };

  return (
    <motion.div
      className="glass-card p-4 h-full flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center mb-3">
        <FileText className="text-purple-400 mr-2" size={20} />
        <h2 className="text-lg font-medium text-purple-400">Diario dell'Agente</h2>
      </div>

      <div className="horizontal-line mb-4"></div>
      
      {/* Note input area */}
      <div className="mb-4">
        <div className="relative">
          <Textarea
            placeholder="Aggiungi una nota personale..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            className="resize-none bg-black/30 border-gray-700 focus:border-purple-500 text-sm"
            rows={2}
          />
          <MagneticButton
            className="absolute right-2 bottom-2 text-purple-400 hover:text-purple-300 disabled:text-gray-600"
            disabled={!newNote.trim()}
            onClick={handleAddNote}
          >
            <Send size={18} />
          </MagneticButton>
        </div>
      </div>
      
      {/* Timeline */}
      <div className="flex-1 overflow-y-auto scrollbar-none">
        <div className="space-y-4">
          <AnimatePresence>
            {entries.map((entry, index) => (
              <motion.div
                key={index}
                className="relative pl-6 pb-4"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Timeline line */}
                <div className="absolute left-2 top-0 bottom-0 w-px bg-gray-800"></div>
                
                {/* Timeline icon */}
                <div className="absolute left-0 top-0 w-4 h-4 rounded-full bg-black border border-gray-700 flex items-center justify-center">
                  {getEntryIcon(entry.type)}
                </div>
                
                {/* Content */}
                <div>
                  <div className="text-xs text-gray-400 mb-1">
                    {format(new Date(entry.timestamp), "d MMM, HH:mm", { locale: it })}
                  </div>
                  <div className="bg-black/30 p-2 rounded border border-gray-800 text-sm">
                    {entry.content}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {entries.length === 0 && (
              <motion.div 
                className="text-center py-8 text-gray-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <FileText size={24} className="mx-auto mb-2 opacity-50" />
                <p>Il tuo diario è vuoto</p>
                <p className="text-xs mt-1">Aggiungi note o acquista indizi</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
