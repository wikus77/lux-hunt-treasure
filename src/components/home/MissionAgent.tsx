
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Activity, FileText, ShoppingBag, Search, Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface AgentNote {
  id: string;
  content: string;
  timestamp: string;
}

const MissionAgent: React.FC = () => {
  const [notes, setNotes] = useLocalStorage<AgentNote[]>("agent-notes", []);
  const [activeTab, setActiveTab] = useState("activity");
  const [showActivities, setShowActivities] = useState(false);

  const addNote = () => {
    const noteContent = prompt("Inserisci una nuova nota:");
    if (noteContent && noteContent.trim()) {
      const newNote: AgentNote = {
        id: Date.now().toString(),
        content: noteContent.trim(),
        timestamp: new Date().toLocaleString()
      };
      setNotes([newNote, ...notes]);
    }
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(note => note.id !== id));
  };

  const agentActions = [
    { id: "activity", icon: Activity, label: "Attività", color: "#00D1FF" },
    { id: "notes", icon: FileText, label: "Note Personali", color: "#FACC15" },
    { id: "purchases", icon: ShoppingBag, label: "Acquisti", color: "#FC1EFF" },
    { id: "clues", icon: Search, label: "Indizi", color: "#7B2EFF" }
  ];

  return (
    <motion.div 
      className="bg-gradient-to-br from-[#1C1C1F] to-[#000000] rounded-[24px] border border-white/10 p-6"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <h2 className="text-xl font-orbitron font-bold text-white mb-6">
        Mission Agent
      </h2>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {agentActions.map((action) => {
          const IconComponent = action.icon;
          return (
            <button
              key={action.id}
              onClick={() => setActiveTab(action.id)}
              className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${
                activeTab === action.id
                  ? "bg-white/10 border-white/20"
                  : "bg-white/5 border-white/10 hover:bg-white/8"
              }`}
            >
              <IconComponent 
                className="w-4 h-4" 
                style={{ color: action.color }} 
              />
              <span className="text-white text-sm font-medium">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="min-h-[200px]">
        {activeTab === "activity" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Diario Attività</h3>
              <button
                onClick={() => setShowActivities(!showActivities)}
                className="flex items-center gap-1 text-[#00D1FF] text-sm hover:text-white transition-colors"
              >
                Attività
                <ChevronDown className={`w-4 h-4 transition-transform ${showActivities ? "rotate-180" : ""}`} />
              </button>
            </div>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <Activity className="w-8 h-8 text-white/40 mx-auto mb-2" />
              <p className="text-white/60 text-sm">Nessuna attività registrata</p>
            </div>
          </div>
        )}

        {activeTab === "notes" && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Note Personali</h3>
              <Button
                onClick={addNote}
                size="sm"
                className="bg-gradient-to-r from-[#7B2EFF] to-[#FC1EFF] hover:from-[#6A25CC] hover:to-[#E01BCC] text-white"
              >
                <Plus className="w-4 h-4 mr-1" />
                Aggiungi Nota
              </Button>
            </div>
            
            {notes.length === 0 ? (
              <div className="bg-white/5 rounded-lg p-4 text-center">
                <FileText className="w-8 h-8 text-white/40 mx-auto mb-2" />
                <p className="text-white/60 text-sm">Nessuna nota salvata</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-40 overflow-y-auto">
                {notes.map((note) => (
                  <div key={note.id} className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <p className="text-white text-sm mb-2">{note.content}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-white/40 text-xs">{note.timestamp}</span>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        Elimina
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "purchases" && (
          <div>
            <h3 className="text-white font-medium mb-4">Cronologia Acquisti</h3>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <ShoppingBag className="w-8 h-8 text-white/40 mx-auto mb-2" />
              <p className="text-white/60 text-sm">Nessun acquisto effettuato</p>
            </div>
          </div>
        )}

        {activeTab === "clues" && (
          <div>
            <h3 className="text-white font-medium mb-4">Indizi Raccolti</h3>
            <div className="bg-white/5 rounded-lg p-4 text-center">
              <Search className="w-8 h-8 text-white/40 mx-auto mb-2" />
              <p className="text-white/60 text-sm">Nessun indizio sbloccato</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default MissionAgent;
