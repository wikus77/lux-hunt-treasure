
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Edit3, Calendar, MessageSquare, ChevronDown, User, Clock, Plus } from "lucide-react";

interface DiaryEntry {
  type: "purchase" | "note" | "achievement" | "clue";
  content: string;
  timestamp: string;
}

interface AgentDiaryProps {
  entries: DiaryEntry[];
  onAddNote: (note: string) => void;
  purchasedClues: any[];
}

export function AgentDiary({ entries, onAddNote, purchasedClues }: AgentDiaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [showAddNote, setShowAddNote] = useState(false);

  const handleHeaderClick = () => {
    setIsExpanded(!isExpanded);
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(newNote.trim());
      setNewNote("");
      setShowAddNote(false);
    }
  };

  const getEntryIcon = (type: string) => {
    switch (type) {
      case "purchase":
        return <MessageSquare className="w-4 h-4 text-blue-400" />;
      case "note":
        return <Edit3 className="w-4 h-4 text-green-400" />;
      case "achievement":
        return <Calendar className="w-4 h-4 text-yellow-400" />;
      case "clue":
        return <BookOpen className="w-4 h-4 text-purple-400" />;
      default:
        return <MessageSquare className="w-4 h-4 text-gray-400" />;
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

  return (
    <motion.div 
      className="rounded-2xl bg-[#1a1a2e] border border-[#16213e] shadow-lg backdrop-blur-xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div 
        className="p-4 border-b border-white/10 flex justify-between items-center"
        onClick={handleHeaderClick}
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-lg md:text-xl font-orbitron font-bold">
            <span className="text-[#00D1FF]" style={{ 
              textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)"
            }}>M1</span>
            <span className="text-white">SSION AGENT</span>
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-xs text-white/70">Attività: {entries.length}</span>
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
            <div className="p-4">
              {/* Agent Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-[#0a0a0a] p-3 rounded-lg text-center">
                  <p className="text-lg font-bold text-blue-400">{stats.totalEntries}</p>
                  <p className="text-xs text-white/60">Attività Totali</p>
                </div>
                <div className="bg-[#0a0a0a] p-3 rounded-lg text-center">
                  <p className="text-lg font-bold text-green-400">{stats.notesCount}</p>
                  <p className="text-xs text-white/60">Note Personali</p>
                </div>
                <div className="bg-[#0a0a0a] p-3 rounded-lg text-center">
                  <p className="text-lg font-bold text-yellow-400">{stats.purchasesCount}</p>
                  <p className="text-xs text-white/60">Acquisti</p>
                </div>
                <div className="bg-[#0a0a0a] p-3 rounded-lg text-center">
                  <p className="text-lg font-bold text-purple-400">{stats.cluesCount}</p>
                  <p className="text-xs text-white/60">Indizi</p>
                </div>
              </div>

              {/* Add Note Section */}
              <div className="mb-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAddNote(!showAddNote);
                  }}
                  className="w-full p-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg text-white hover:from-blue-600/30 hover:to-purple-600/30 transition-all flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Aggiungi Nota Personale</span>
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
                          className="w-full p-3 bg-[#0a0a0a] border border-white/20 rounded-lg text-white placeholder-white/50 resize-none focus:outline-none focus:border-blue-500/50"
                          rows={3}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddNote();
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm hover:from-blue-700 hover:to-purple-700 transition-all"
                          >
                            Salva Nota
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowAddNote(false);
                              setNewNote("");
                            }}
                            className="px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition-all"
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
              <div className="space-y-3 max-h-[calc(100vh-30rem)] overflow-y-auto pr-1 custom-scrollbar">
                <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
                  <BookOpen className="w-4 h-4 text-blue-400" />
                  <span>Diario delle Attività</span>
                </h4>
                
                {entries.length > 0 ? (
                  entries.map((entry, index) => (
                    <motion.div
                      key={index}
                      className="p-3 bg-[#0a0a0a] rounded-lg border border-white/10 hover:border-white/20 transition-colors"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getEntryIcon(entry.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-sm leading-relaxed break-words">
                            {entry.content}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Clock className="w-3 h-3 text-white/40" />
                            <span className="text-xs text-white/60">
                              {formatTimestamp(entry.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-8 text-white/50">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 text-white/30" />
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
