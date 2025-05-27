
import React, { useState } from "react";
import { motion } from "framer-motion";
import GradientBox from "@/components/ui/gradient-box";
import { useLongPress } from "@/hooks/useLongPress";
import { useIsMobile } from "@/hooks/use-mobile";

interface DiaryEntry {
  type: "purchase" | "note" | "achievement";
  content: string;
  timestamp: string;
  id?: string;
}

interface AgentDiaryProps {
  entries: DiaryEntry[];
  onAddNote: (note: string) => void;
  purchasedClues: any[];
}

export function AgentDiary({ entries, onAddNote, purchasedClues }: AgentDiaryProps) {
  const [newNote, setNewNote] = useState("");
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const isMobile = useIsMobile();
  
  const handleAddNote = () => {
    if (newNote.trim()) {
      onAddNote(newNote);
      setNewNote("");
    }
  };

  const handleEditEntry = (entry: DiaryEntry, index: number) => {
    if (entry.type === "note") {
      const entryId = `${entry.type}-${index}`;
      setEditingEntry(entryId);
      setEditContent(entry.content);
    }
  };

  const handleSaveEdit = () => {
    // Here you would normally save to your state management or database
    // For now, we'll just exit edit mode
    setEditingEntry(null);
    setEditContent("");
  };

  const handleCancelEdit = () => {
    setEditingEntry(null);
    setEditContent("");
  };

  // Long press functionality for mobile fullscreen
  const longPressProps = useLongPress(
    () => {
      if (isMobile) {
        setIsFullscreen(true);
      }
    },
    {
      threshold: 800, // 800ms for long press
    }
  );
  
  // Format timestamp to a readable format
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString().substring(0, 5);
  };

  // Fullscreen component
  const FullscreenView = () => (
    <motion.div
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      onClick={() => setIsFullscreen(false)}
    >
      <div className="h-full w-full p-6 overflow-y-auto">
        <GradientBox>
          <div className="p-4 border-b border-white/10 flex justify-between items-center">
            <h2 className="text-xl md:text-2xl font-orbitron font-bold">
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
            <div className="space-y-2">
              {entries.length === 0 ? (
                <div className="text-center py-6 text-white/50">
                  Il tuo diario è vuoto. Aggiungi note o completa obiettivi per visualizzarli qui.
                </div>
              ) : (
                entries.map((entry, index) => {
                  const entryId = `${entry.type}-${index}`;
                  const isEditing = editingEntry === entryId;
                  
                  return (
                    <motion.div
                      key={index}
                      className={`p-3 rounded-lg cursor-pointer ${
                        entry.type === "purchase" ? "bg-[#7B2EFF]/10 border border-[#7B2EFF]/30" :
                        entry.type === "achievement" ? "bg-amber-500/10 border border-amber-500/30" :
                        "bg-black/20 border border-white/10"
                      }`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      onClick={() => handleEditEntry(entry, index)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          {isEditing ? (
                            <div className="space-y-2">
                              <textarea
                                className="w-full bg-black/30 border border-[#00D1FF]/50 rounded px-2 py-1 text-white text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#00D1FF]"
                                value={editContent}
                                onChange={(e) => setEditContent(e.target.value)}
                                rows={3}
                                autoFocus
                              />
                              <div className="flex gap-2">
                                <button
                                  className="text-xs bg-[#00D1FF] text-black px-2 py-1 rounded hover:opacity-80"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSaveEdit();
                                  }}
                                >
                                  Salva
                                </button>
                                <button
                                  className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:opacity-80"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCancelEdit();
                                  }}
                                >
                                  Annulla
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="text-white text-sm">{entry.content}</p>
                              <span className="text-white/40 text-xs">{formatTimestamp(entry.timestamp)}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </GradientBox>
      </div>
    </motion.div>
  );
  
  return (
    <>
      <GradientBox {...(isMobile ? longPressProps : {})}>
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
              entries.map((entry, index) => {
                const entryId = `${entry.type}-${index}`;
                const isEditing = editingEntry === entryId;
                
                return (
                  <motion.div
                    key={index}
                    className={`p-3 rounded-lg cursor-pointer ${
                      entry.type === "purchase" ? "bg-[#7B2EFF]/10 border border-[#7B2EFF]/30" :
                      entry.type === "achievement" ? "bg-amber-500/10 border border-amber-500/30" :
                      "bg-black/20 border border-white/10"
                    }`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => handleEditEntry(entry, index)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {isEditing ? (
                          <div className="space-y-2">
                            <textarea
                              className="w-full bg-black/30 border border-[#00D1FF]/50 rounded px-2 py-1 text-white text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#00D1FF]"
                              value={editContent}
                              onChange={(e) => setEditContent(e.target.value)}
                              rows={3}
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <button
                                className="text-xs bg-[#00D1FF] text-black px-2 py-1 rounded hover:opacity-80"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSaveEdit();
                                }}
                              >
                                Salva
                              </button>
                              <button
                                className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:opacity-80"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancelEdit();
                                }}
                              >
                                Annulla
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="text-white text-sm">{entry.content}</p>
                            <span className="text-white/40 text-xs">{formatTimestamp(entry.timestamp)}</span>
                          </>
                        )}
                      </div>
                      {entry.type === "note" && !isEditing && (
                        <div className="text-white/40 hover:text-white/60 text-xs ml-2">
                          ✏️
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </GradientBox>

      {/* Fullscreen overlay for mobile */}
      {isFullscreen && <FullscreenView />}
    </>
  );
}
