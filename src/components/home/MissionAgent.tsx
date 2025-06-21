
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Plus, Brain, Package, Search, Target } from "lucide-react";

interface DiaryEntry {
  type: "purchase" | "note" | "achievement" | "clue";
  content: string;
  timestamp: string;
}

interface MissionAgentProps {
  entries: DiaryEntry[];
  onAddNote: (note: string) => void;
  purchasedClues: any[];
}

export function MissionAgent({ entries, onAddNote, purchasedClues }: MissionAgentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [showAddNote, setShowAddNote] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");

  const handleToggle = () => {
    setIsExpanded(!isExpanded);
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(newNote.trim());
      setNewNote("");
      setShowAddNote(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAgentStats = () => {
    return {
      totalEntries: entries.length,
      notesCount: entries.filter(entry => entry.type === 'note').length,
      purchasesCount: entries.filter(entry => entry.type === 'purchase').length,
      cluesCount: purchasedClues.length
    };
  };

  const stats = getAgentStats();

  const actionButtons = [
    { icon: <Target className="w-5 h-5" />, label: "Attività", value: "activity", color: "text-blue-400" },
    { icon: <Brain className="w-5 h-5" />, label: "Note Personali", value: "notes", color: "text-green-400" },
    { icon: <Package className="w-5 h-5" />, label: "Acquisti", value: "purchases", color: "text-yellow-400" },
    { icon: <Search className="w-5 h-5" />, label: "Indizi", value: "clues", color: "text-purple-400" },
  ];

  return (
    <motion.div 
      className="rounded-[20px] bg-[#1C1C1F] backdrop-blur-xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02] mb-4 relative"
      style={{
        background: 'linear-gradient(135deg, #1C1C1F 0%, rgba(28, 28, 31, 0.95) 50%, rgba(252, 30, 255, 0.1) 100%)',
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.1)"
      }}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      onClick={handleToggle}
    >
      <div 
        className="absolute top-0 left-0 w-full h-[1px]"
        style={{
          background: 'linear-gradient(90deg, #FC1EFF 0%, #365EFF 50%, #FACC15 100%)'
        }}
      />
      
      <div className="p-6 border-b border-white/10 flex justify-between items-center">
        <h2 className="text-lg md:text-xl font-orbitron font-bold text-white">
          MISSION AGENT
        </h2>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-white/70">Attività ⌄</span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
          >
            <ChevronDown className="w-4 h-4 text-white/60" />
          </motion.div>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-6">
              {/* Action Buttons */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {actionButtons.map((button, index) => (
                  <motion.button
                    key={button.value}
                    className="bg-[#0a0a0a]/50 p-3 rounded-[16px] text-center hover:bg-[#0a0a0a]/70 transition-all group"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFilter(button.value);
                    }}
                  >
                    <div className={`${button.color} mb-2 group-hover:scale-110 transition-transform`}>
                      {button.icon}
                    </div>
                    <p className="text-xs text-white/60">{button.label}</p>
                  </motion.button>
                ))}
              </div>

              {/* Add Note Section */}
              <div className="mb-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAddNote(!showAddNote);
                  }}
                  className="w-full p-3 bg-gradient-to-r from-[#365EFF]/20 to-[#FC1EFF]/20 border border-[#365EFF]/30 rounded-[16px] text-white hover:from-[#365EFF]/30 hover:to-[#FC1EFF]/30 transition-all flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-orbitron">+ Aggiungi Nota Personale</span>
                </button>

                <AnimatePresence>
                  {showAddNote && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="mt-3 overflow-hidden"
                    >
                      <div className="space-y-3">
                        <textarea
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Scrivi la tua nota personale..."
                          className="w-full p-3 bg-[#0a0a0a]/50 border border-white/20 rounded-[16px] text-white placeholder-white/50 resize-none focus:outline-none focus:border-[#365EFF]/50"
                          rows={3}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddNote();
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-[#365EFF] to-[#FC1EFF] text-white rounded-full text-sm hover:shadow-lg transition-all font-orbitron"
                          >
                            Salva Nota
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowAddNote(false);
                              setNewNote("");
                            }}
                            className="px-4 py-2 bg-gray-600 text-white rounded-full text-sm hover:bg-gray-700 transition-all font-orbitron"
                          >
                            Annulla
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Diary Entries */}
              <div className="space-y-3 max-h-[calc(100vh-30rem)] overflow-y-auto pr-1">
                <h4 className="text-white font-medium mb-3 font-orbitron">
                  Diario delle Attività
                </h4>
                
                {entries.length > 0 ? (
                  entries.map((entry, index) => (
                    <motion.div
                      key={index}
                      className="p-3 bg-[#0a0a0a]/50 rounded-[16px] border border-white/10 hover:border-white/20 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm leading-relaxed break-words">
                            {entry.content}
                          </p>
                          <span className="text-xs text-white/60 mt-2 block">
                            {formatTimestamp(entry.timestamp)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-white/50">
                    <p className="text-sm">Nessuna attività registrata</p>
                    <p className="text-xs text-white/40 mt-1">Le tue azioni verranno registrate qui</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
