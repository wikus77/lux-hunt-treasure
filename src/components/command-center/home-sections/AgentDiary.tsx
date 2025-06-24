
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Plus, Calendar, User, ShoppingBag, MessageSquare, X } from 'lucide-react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface DiaryEntry {
  id?: string;
  type: "note" | "purchase" | "system";
  content: string;
  timestamp: string;
}

interface AgentDiaryProps {
  entries: DiaryEntry[];
  onAddNote: (note: string) => void;
}

export const AgentDiary: React.FC<AgentDiaryProps> = ({ entries, onAddNote }) => {
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [newNote, setNewNote] = useState("");

  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(newNote.trim());
      setNewNote("");
      setIsAddingNote(false);
    }
  };

  const getEntryIcon = (type: string) => {
    switch (type) {
      case "purchase":
        return <ShoppingBag className="w-4 h-4 text-yellow-400" />;
      case "system":
        return <User className="w-4 h-4 text-cyan-400" />;
      case "note":
      default:
        return <MessageSquare className="w-4 h-4 text-purple-400" />;
    }
  };

  const getEntryColor = (type: string) => {
    switch (type) {
      case "purchase":
        return "border-yellow-400/20 bg-yellow-400/5";
      case "system":
        return "border-cyan-400/20 bg-cyan-400/5";
      case "note":
      default:
        return "border-purple-400/20 bg-purple-400/5";
    }
  };

  return (
    <motion.div 
      className="bg-gradient-to-br from-gray-900/95 to-black/95 rounded-xl border border-purple-500/30 p-6"
      style={{
        boxShadow: "0 0 20px rgba(139, 69, 19, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.8)"
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <BookOpen className="w-6 h-6 text-purple-400" />
          <h3 className="text-lg font-orbitron font-bold text-white">DIARIO AGENTE</h3>
        </div>
        
        <motion.button
          className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-2 rounded-lg hover:shadow-lg hover:shadow-purple-400/50 transition-all duration-300"
          onClick={() => setIsAddingNote(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Plus className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Add Note Modal */}
      <AnimatePresence>
        {isAddingNote && (
          <motion.div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-br from-gray-900 to-black rounded-xl border border-purple-500/30 p-6 w-full max-w-md"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-orbitron font-bold text-white">NUOVA NOTA</h4>
                <button
                  onClick={() => setIsAddingNote(false)}
                  className="text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Inserisci la tua nota qui..."
                className="w-full h-32 bg-black/30 border border-white/10 rounded-lg p-3 text-white font-orbitron text-sm resize-none focus:border-purple-400/50 focus:outline-none"
                autoFocus
              />
              
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={() => setIsAddingNote(false)}
                  className="flex-1 bg-gray-600 text-white font-orbitron font-bold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  ANNULLA
                </button>
                <button
                  onClick={handleAddNote}
                  disabled={!newNote.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-orbitron font-bold py-2 px-4 rounded-lg hover:shadow-lg hover:shadow-purple-400/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  AGGIUNGI
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entries List */}
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {entries.length > 0 ? (
          entries.map((entry, index) => (
            <motion.div
              key={index}
              className={`p-4 rounded-lg border ${getEntryColor(entry.type)} transition-all duration-300 hover:border-opacity-50`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  {getEntryIcon(entry.type)}
                </div>
                
                <div className="flex-grow">
                  <p className="text-sm text-white leading-relaxed">
                    {entry.content}
                  </p>
                  
                  <div className="flex items-center space-x-2 mt-2">
                    <Calendar className="w-3 h-3 text-white/40" />
                    <span className="text-xs font-orbitron text-white/40">
                      {format(new Date(entry.timestamp), 'dd MMM yyyy HH:mm', { locale: it })}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/50 font-orbitron text-sm">
              Nessuna voce nel diario
            </p>
            <p className="text-white/30 font-orbitron text-xs mt-1">
              Aggiungi la tua prima nota
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
