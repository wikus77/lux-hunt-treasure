
import React, { useState } from "react";
import { motion } from "framer-motion";

interface DiaryEntry {
  type: string;
  content: string;
  timestamp: string;
}

interface PurchasedClue {
  id: string;
  code: string;
  title: string;
  description: string;
}

interface AgentDiaryProps {
  entries: DiaryEntry[];
  purchasedClues: PurchasedClue[];
  onAddNote: (note: string) => void;
}

export function AgentDiary({ entries, purchasedClues, onAddNote }: AgentDiaryProps) {
  const [newNote, setNewNote] = useState("");
  const [activeTab, setActiveTab] = useState<"diary" | "clues">("diary");

  const handleSubmitNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNote.trim()) {
      onAddNote(newNote.trim());
      setNewNote("");
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('it-IT', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return "Data sconosciuta";
    }
  };

  return (
    <div className="glass-card rounded-xl" style={{ 
      background: "linear-gradient(180deg, rgba(19, 21, 36, 0.5) 0%, rgba(0, 0, 0, 0.5) 100%)",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2), inset 0 2px 3px rgba(255, 255, 255, 0.06)"
    }}>
      <div className="p-4 border-b border-white/10 flex justify-between items-center">
        <h2 className="text-lg md:text-xl font-orbitron font-bold">
          <span className="text-[#00D1FF]" style={{ 
            textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)"
          }}>M1</span>
          <span className="text-white">SSION AGENT</span>
        </h2>
      </div>
      
      <div className="flex border-b border-white/10">
        <button
          className={`flex-1 py-2 px-4 text-center text-sm font-medium ${
            activeTab === "diary" 
              ? "text-white bg-white/10" 
              : "text-white/60 hover:text-white/80 hover:bg-white/5"
          }`}
          onClick={() => setActiveTab("diary")}
        >
          Diario Missione
        </button>
        <button
          className={`flex-1 py-2 px-4 text-center text-sm font-medium ${
            activeTab === "clues" 
              ? "text-white bg-white/10" 
              : "text-white/60 hover:text-white/80 hover:bg-white/5"
          }`}
          onClick={() => setActiveTab("clues")}
        >
          Indizi ({purchasedClues.length})
        </button>
      </div>
      
      {activeTab === "diary" && (
        <div className="p-4">
          <form onSubmit={handleSubmitNote} className="mb-4">
            <textarea
              className="w-full p-3 bg-black/20 border border-white/10 rounded-lg text-white resize-none focus:outline-none focus:ring-1 focus:ring-[#00D1FF]"
              placeholder="Aggiungi una nota personale..."
              rows={2}
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                className="px-4 py-1 rounded-full bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] text-white text-sm hover:shadow-[0_0_10px_rgba(0,209,255,0.4)] transition-all"
                disabled={!newNote.trim()}
              >
                Salva
              </button>
            </div>
          </form>
          
          <div className="space-y-3 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
            {entries.length > 0 ? (
              entries.map((entry, index) => (
                <motion.div
                  key={index}
                  className="p-3 rounded-lg border border-white/10 bg-black/20"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index, duration: 0.3 }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-white/90 text-sm">{entry.content}</p>
                      <p className="text-white/50 text-xs mt-1">
                        {formatDate(entry.timestamp)}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      entry.type === "note" 
                        ? "bg-[#7B2EFF]/30 text-[#7B2EFF]" 
                        : "bg-[#00D1FF]/30 text-[#00D1FF]"
                    }`}>
                      {entry.type === "note" ? "Nota" : "Acquisto"}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-white/50">
                Nessuna nota nel diario. Aggiungi la tua prima osservazione.
              </div>
            )}
          </div>
        </div>
      )}
      
      {activeTab === "clues" && (
        <div className="p-4">
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1 scrollbar-thin">
            {purchasedClues.length > 0 ? (
              purchasedClues.map((clue, index) => (
                <motion.div
                  key={clue.id}
                  className="p-3 rounded-lg border border-white/10 bg-black/20"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index, duration: 0.3 }}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-[#00D1FF] to-[#7B2EFF] flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span className="text-xs font-mono bg-white/10 px-2 py-0.5 rounded text-white/70">
                          {clue.code}
                        </span>
                        <h3 className="text-white ml-2 font-medium">{clue.title}</h3>
                      </div>
                      <p className="text-white/70 text-sm mt-1">
                        {clue.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-white/50">
                Nessun indizio acquistato. Usa la console per sbloccare indizi.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
