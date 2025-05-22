
import React, { useState } from "react";
import { motion } from "framer-motion";
import GradientBox from "@/components/ui/gradient-box";

interface DiaryEntry {
  type: "purchase" | "note" | "achievement";
  content: string;
  timestamp: string;
}

interface AgentDiaryProps {
  entries: DiaryEntry[];
  onAddNote: (note: string) => void;
  purchasedClues: any[];
}

export function AgentDiary({ entries, onAddNote, purchasedClues }: AgentDiaryProps) {
  const [newNote, setNewNote] = useState("");
  
  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(newNote);
      setNewNote("");
    }
  };
  
  // Format timestamp to a readable format
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString().substring(0, 5);
  };
  
  return (
    <GradientBox>
      <div className="p-4 border-b border-white/10 flex justify-between items-center">
        <h2 className="text-lg md:text-xl font-orbitron font-bold">
          <span className="text-[#00D1FF]" style={{ 
            textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)"
          }}>M1</span>
          <span className="text-white">SSION AGENT</span>
        </h2>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-white/70">Indizi ({purchasedClues.length})</span>
        </div>
      </div>
      
      <div className="p-4">
        {/* Note input area */}
        <div className="flex mb-4">
          <input
            type="text"
            className="flex-1 bg-black/20 border border-white/10 rounded-l-lg px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#00D1FF]"
            placeholder="Aggiungi una nota personale..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
          />
          <button
            className="bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] text-white px-4 py-2 rounded-r-lg hover:opacity-90"
            onClick={handleAddNote}
          >
            Salva
          </button>
        </div>
        
        {/* Diary entries */}
        <div className="space-y-2 max-h-[calc(100vh-25rem)] overflow-y-auto pr-1 custom-scrollbar">
          {entries.length === 0 ? (
            <div className="text-center py-6 text-white/50">
              Il tuo diario è vuoto. Aggiungi note o completa obiettivi per visualizzarli qui.
            </div>
          ) : (
            entries.map((entry, index) => (
              <motion.div
                key={index}
                className={`p-3 rounded-lg ${
                  entry.type === "purchase" ? "bg-[#7B2EFF]/10 border border-[#7B2EFF]/30" :
                  entry.type === "achievement" ? "bg-amber-500/10 border border-amber-500/30" :
                  "bg-black/20 border border-white/10"
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white text-sm">{entry.content}</p>
                    <span className="text-white/40 text-xs">{formatTimestamp(entry.timestamp)}</span>
                  </div>
                  {entry.type === "note" && (
                    <button className="text-white/40 hover:text-white/60 text-xs">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M6 2l2-2h4l2 2h4a2 2 0 012 2v12a2 2 0 01-2 2H2a2 2 0 01-2-2V4a2 2 0 012-2h4z" />
                      </svg>
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </GradientBox>
  );
}
