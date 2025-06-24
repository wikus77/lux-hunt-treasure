
import React, { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Plus, Clock, ShoppingBag, FileText, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
  const [showAddNote, setShowAddNote] = useState(false);

  const handleSubmitNote = () => {
    if (newNote.trim()) {
      onAddNote(newNote.trim());
      setNewNote("");
      setShowAddNote(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getEntryIcon = (type: string) => {
    switch (type) {
      case "purchase": return ShoppingBag;
      case "note": return FileText;
      case "achievement": return Clock;
      default: return FileText;
    }
  };

  const getEntryColor = (type: string) => {
    switch (type) {
      case "purchase": return "text-green-400 bg-green-400/10";
      case "note": return "text-blue-400 bg-blue-400/10";
      case "achievement": return "text-purple-400 bg-purple-400/10";
      default: return "text-gray-400 bg-gray-400/10";
    }
  };

  return (
    <GradientBox className="w-full h-full">
      <div className="p-4 border-b border-white/10">
        <div className="flex justify-between items-center">
          <h2 className="text-lg md:text-xl font-orbitron font-bold">
            <span className="text-[#00D1FF]" style={{ 
              textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)"
            }}>M1</span>
            <span className="text-white">SSION<span className="text-xs align-top">™</span> AGENT</span>
          </h2>
          <Button
            onClick={() => setShowAddNote(!showAddNote)}
            size="sm"
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            Nota
          </Button>
        </div>
      </div>

      <div className="p-4">
        {/* Add Note Section */}
        {showAddNote && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20"
          >
            <h3 className="text-sm font-bold text-purple-300 mb-2">Aggiungi Nota Personale</h3>
            <Textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Scrivi qui la tua nota..."
              className="bg-black/40 border-white/10 text-white placeholder-white/50 mb-3"
              rows={3}
            />
            <div className="flex space-x-2">
              <Button
                onClick={handleSubmitNote}
                disabled={!newNote.trim()}
                size="sm"
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              >
                <Send className="w-3 h-3 mr-1" />
                Salva
              </Button>
              <Button
                onClick={() => {
                  setShowAddNote(false);
                  setNewNote("");
                }}
                size="sm"
                variant="outline"
                className="border-white/20 text-white/70 hover:text-white hover:bg-white/10"
              >
                Annulla
              </Button>
            </div>
          </motion.div>
        )}

        {/* Entries List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {entries.length === 0 ? (
            <div className="text-center py-8 text-white/50">
              <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Il tuo diario è vuoto</p>
              <p className="text-xs">Inizia aggiungendo una nota personale</p>
            </div>
          ) : (
            entries.map((entry, index) => {
              const Icon = getEntryIcon(entry.type);
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-black/20 rounded-lg p-3 border border-white/10 hover:border-cyan-400/30 transition-all"
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-full ${getEntryColor(entry.type)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-white/90">{entry.content}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Clock className="w-3 h-3 text-white/50" />
                        <span className="text-xs text-white/50">
                          {formatTimestamp(entry.timestamp)}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getEntryColor(entry.type)}`}>
                          {entry.type === "purchase" ? "ACQUISTO" : 
                           entry.type === "note" ? "NOTA" : "ACHIEVEMENT"}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Summary Stats */}
        {entries.length > 0 && (
          <div className="mt-4 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
            <div className="flex justify-between items-center text-xs">
              <span className="text-cyan-300">Attività Totali: {entries.length}</span>
              <span className="text-cyan-300">Indizi: {purchasedClues.length}</span>
            </div>
          </div>
        )}
      </div>
    </GradientBox>
  );
}
