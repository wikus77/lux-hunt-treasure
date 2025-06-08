
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(false);
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

  // Handle click for desktop or toggle expansion
  const handleClick = () => {
    if (!isMobile) {
      setIsFullscreen(true);
    } else {
      setIsExpanded(!isExpanded);
    }
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
        <div className="rounded-2xl bg-[#121212] border border-[#2c2c2c] shadow-lg backdrop-blur-xl overflow-hidden">
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
                className="flex-1 bg-[#121212] border border-[#2c2c2c] rounded-l-2xl px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#00D1FF]"
                placeholder="Aggiungi una nota personale..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
              />
              <button
                className="bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] text-white px-4 py-2 rounded-r-2xl hover:opacity-90"
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
                      className={`p-3 rounded-2xl cursor-pointer shadow-md bg-[#121212] border ${
                        entry.type === "purchase" ? "border-[#7B2EFF]/30" :
                        entry.type === "achievement" ? "border-amber-500/30" :
                        "border-[#2c2c2c]"
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
                                className="w-full bg-[#121212] border border-[#00D1FF]/50 rounded-2xl px-2 py-1 text-white text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#00D1FF]"
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
        </div>
      </div>
    </motion.div>
  );
  
  return (
    <>
      <motion.div 
        className="rounded-2xl bg-[#121212] border border-[#2c2c2c] shadow-lg backdrop-blur-xl overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div 
          className="p-4 border-b border-white/10 flex justify-between items-center"
          onClick={handleClick}
          {...(isMobile ? longPressProps : {})}
        >
          <h2 className="text-lg md:text-xl font-orbitron font-bold">
            <span className="text-[#00D1FF]" style={{ 
              textShadow: "0 0 10px rgba(0, 209, 255, 0.6), 0 0 20px rgba(0, 209, 255, 0.3)"
            }}>M1</span>
            <span className="text-white">SSION AGENT</span>
          </h2>
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-white/70">Indizi ({purchasedClues.length})</span>
            {isMobile && (
              <motion.div
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ChevronDown className="w-4 h-4 text-white/60" />
              </motion.div>
            )}
          </div>
        </div>
        
        <AnimatePresence>
          {!isMobile || isExpanded ? (
            <motion.div
              initial={isMobile ? { height: 0, opacity: 0 } : { height: "auto", opacity: 1 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: isMobile ? 0.5 : 0, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="p-4">
                {/* Note input area */}
                <div className="flex mb-4">
                  <input
                    type="text"
                    className="flex-1 bg-[#121212] border border-[#2c2c2c] rounded-l-2xl px-3 py-2 text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#00D1FF]"
                    placeholder="Aggiungi una nota personale..."
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                  />
                  <button
                    className="bg-gradient-to-r from-[#00D1FF] to-[#7B2EFF] text-white px-4 py-2 rounded-r-2xl hover:opacity-90"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddNote();
                    }}
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
                          className={`p-3 rounded-2xl cursor-pointer shadow-md bg-[#121212] border ${
                            entry.type === "purchase" ? "border-[#7B2EFF]/30" :
                            entry.type === "achievement" ? "border-amber-500/30" :
                            "border-[#2c2c2c]"
                          }`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditEntry(entry, index);
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              {isEditing ? (
                                <div className="space-y-2">
                                  <textarea
                                    className="w-full bg-[#121212] border border-[#00D1FF]/50 rounded-2xl px-2 py-1 text-white text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[#00D1FF]"
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
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>

      {/* Fullscreen overlay for desktop */}
      {isFullscreen && <FullscreenView />}
    </>
  );
}
