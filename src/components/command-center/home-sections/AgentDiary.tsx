
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Book, Clock, Plus, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { MagneticButton } from "@/components/ui/magnetic-button";

interface AgentDiaryProps {
  entries: Array<{
    type: string;
    content: string;
    timestamp: string;
  }>;
  onAddNote: (note: string) => void;
  purchasedClues: Array<any>;
}

export function AgentDiary({ entries, onAddNote, purchasedClues }: AgentDiaryProps) {
  const [newNote, setNewNote] = useState("");
  const [showAddNote, setShowAddNote] = useState(false);

  const handleSubmitNote = () => {
    if (newNote.trim()) {
      onAddNote(newNote);
      setNewNote("");
      setShowAddNote(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      return format(new Date(timestamp), "HH:mm • dd/MM");
    } catch (error) {
      return "Data sconosciuta";
    }
  };

  const getEntryIcon = (type: string) => {
    switch(type) {
      case "purchase":
        return <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm">$</div>;
      case "note":
        return <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-white text-sm">N</div>;
      default:
        return <div className="w-6 h-6 rounded-full bg-gray-500 flex items-center justify-center text-white text-sm">?</div>;
    }
  };

  return (
    <motion.div
      className="glass-card p-4 h-full flex flex-col"
      initial={{ scale: 0.95 }}
      animate={{ scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Book className="text-amber-400 mr-2" size={20} />
          <h2 className="text-lg font-medium flex items-center">
            <span className="text-cyan-400">M1</span>
            <span className="text-white">SSION</span> 
            <span className="text-white ml-1">AGENT</span>
          </h2>
        </div>

        {!showAddNote && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowAddNote(true)} 
            className="text-white hover:bg-amber-900/30 hover:text-amber-400"
          >
            <Plus size={16} className="mr-1" /> Nota
          </Button>
        )}
      </div>

      <div className="horizontal-line mb-4"></div>

      {showAddNote && (
        <div className="mb-4 bg-black/30 p-3 rounded-md border border-amber-900/40">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Inserisci una nota personale..."
            className="w-full h-20 bg-black/30 border border-amber-900/30 rounded px-3 py-2 mb-2 text-white text-sm focus:outline-none focus:border-amber-500 placeholder:text-gray-500"
          />
          <div className="flex space-x-2 justify-end">
            <Button
              variant="ghost" 
              size="sm"
              onClick={() => setShowAddNote(false)}
              className="text-gray-400 hover:bg-gray-900/30"
            >
              Annulla
            </Button>
            <Button
              onClick={handleSubmitNote}
              className="bg-amber-700/50 hover:bg-amber-600/50 text-white flex items-center gap-2"
              size="sm"
            >
              <Send size={14} /> Salva nota
            </Button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
        <div className="space-y-3">
          {entries.length > 0 ? (
            entries.map((entry, index) => (
              <motion.div 
                key={index} 
                className="bg-black/30 p-3 rounded-md border border-gray-700/50 text-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center">
                    {getEntryIcon(entry.type)}
                    <span className="ml-2 text-xs text-gray-400">{entry.type === 'note' ? 'Nota personale' : 'Acquisto indizio'}</span>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock size={12} className="mr-1" />
                    {formatTimestamp(entry.timestamp)}
                  </div>
                </div>
                <div className="mt-1 text-white">{entry.content}</div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 italic">
              Nessun elemento nel diario. Aggiungi note o acquista indizi.
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-amber-900/30">
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-500">
            {purchasedClues.length} indizi acquisiti
          </div>
          <MagneticButton
            className="bg-amber-900/30 text-amber-400 text-xs rounded-full px-4 py-1.5 hover:bg-amber-800/40"
            onClick={() => setShowAddNote(true)}
            strength={15}
          >
            <Plus size={12} className="mr-1" /> Aggiungi nota
          </MagneticButton>
        </div>
      </div>
    </motion.div>
  );
}
