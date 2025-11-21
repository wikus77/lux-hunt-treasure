
import React, { useState } from "react";
import { motion } from "framer-motion";
import { BrainCircuit, ZoomIn, ZoomOut, Trash2, Save, Link2, ArrowUpRight } from "lucide-react";
import { AnalysisItem } from "@/data/commandCenterData";

interface AnalysisBoardProps {
  items: AnalysisItem[];
}

interface PositionedItem extends AnalysisItem {
  position: { x: number; y: number };
  isDragging: boolean;
}

export const AnalysisBoard: React.FC<AnalysisBoardProps> = ({ items }) => {
  // Initialize items with random positions
  const [boardItems, setBoardItems] = useState<PositionedItem[]>(() => 
    items.map((item) => ({
      ...item,
      position: {
        x: 50 + Math.random() * 300,
        y: 50 + Math.random() * 150
      },
      isDragging: false
    }))
  );
  
  const [zoom, setZoom] = useState(1);
  const [showConnections, setShowConnections] = useState(true);
  
  const handleDragStart = (id: string) => {
    setBoardItems(boardItems.map(item => ({
      ...item,
      isDragging: item.id === id
    })));
  };

  const handleDragEnd = (id: string) => {
    setBoardItems(boardItems.map(item => ({
      ...item,
      isDragging: false
    })));
  };

  const handleDrag = (id: string, position: { x: number; y: number }) => {
    setBoardItems(boardItems.map(item => 
      item.id === id ? { ...item, position } : item
    ));
  };

  const clearBoard = () => {
    const confirmClear = window.confirm("Sei sicuro di voler cancellare la lavagna di analisi?");
    if (confirmClear) {
      // Reset positions to random
      setBoardItems(items.map((item) => ({
        ...item,
        position: {
          x: 50 + Math.random() * 300,
          y: 50 + Math.random() * 150
        },
        isDragging: false
      })));
    }
  };

  const renderConnections = () => {
    if (!showConnections) return null;
    
    return boardItems.flatMap(item =>
      item.connections.map(connectionId => {
        const connectedItem = boardItems.find(i => i.id === connectionId);
        if (!connectedItem) return null;
        
        const startPos = item.position;
        const endPos = connectedItem.position;
        
        return (
          <svg
            key={`${item.id}-${connectionId}`}
            className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
            style={{ transform: `scale(${zoom})` }}
          >
            <line
              x1={startPos.x + 50}
              y1={startPos.y + 50}
              x2={endPos.x + 50}
              y2={endPos.y + 50}
              stroke="#00e5ff"
              strokeWidth={2}
              strokeOpacity={0.5}
              strokeDasharray="5,5"
            />
          </svg>
        );
      })
    );
  };

  return (
    <motion.div 
      className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-xl p-4 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-cyan-300 flex items-center">
          <BrainCircuit className="inline mr-2 h-5 w-5" />
          Tavolo di Analisi
        </h2>
        <div className="flex space-x-2">
          <button 
            className={`p-1.5 rounded-full ${showConnections ? "bg-cyan-700/50 text-cyan-300" : "bg-black/50 text-white/50"}`}
            onClick={() => setShowConnections(!showConnections)}
            title="Mostra/nascondi collegamenti"
          >
            <Link2 className="h-4 w-4" />
          </button>
          <button 
            className="p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white/70 hover:text-white"
            onClick={() => setZoom(Math.min(zoom + 0.1, 1.5))}
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button 
            className="p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white/70 hover:text-white"
            onClick={() => setZoom(Math.max(zoom - 0.1, 0.7))}
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <button 
            className="p-1.5 rounded-full bg-black/50 hover:bg-red-900/50 text-white/70 hover:text-red-300"
            onClick={clearBoard}
            title="Cancella tavolo"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button 
            className="p-1.5 rounded-full bg-black/50 hover:bg-cyan-900/50 text-white/70 hover:text-cyan-300"
            title="Salva analisi"
          >
            <Save className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="relative h-[300px] bg-black/70 border border-gray-800 rounded-lg overflow-hidden">
        <div 
          className="absolute inset-0 bg-[url('/grid-pattern.png')] bg-repeat opacity-[0.05]"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
        />
        
        {renderConnections()}
        
        {boardItems.map((item) => (
          <motion.div
            key={item.id}
            className={`absolute cursor-grab bg-black/80 border ${
              item.type === 'clue' ? 'border-cyan-500/50' :
              item.type === 'location' ? 'border-green-500/50' :
              item.type === 'person' ? 'border-amber-500/50' :
              'border-purple-500/50'
            } rounded-lg shadow-lg p-2 w-[100px] h-[100px] overflow-hidden flex flex-col items-center`}
            style={{ 
              x: item.position.x, 
              y: item.position.y,
              scale: zoom, 
              zIndex: item.isDragging ? 50 : 20,
              boxShadow: item.isDragging ? "0 0 15px rgba(0, 229, 255, 0.5)" : "none"
            }}
            drag
            dragConstraints={{ left: 0, right: 500, top: 0, bottom: 200 }}
            dragTransition={{ bounceStiffness: 300, bounceDamping: 10 }}
            dragElastic={0.1}
            onDragStart={() => handleDragStart(item.id)}
            onDragEnd={() => handleDragEnd(item.id)}
            onDrag={(_, info) => handleDrag(item.id, { 
              x: item.position.x + info.delta.x / zoom,
              y: item.position.y + info.delta.y / zoom,
            })}
          >
            {item.imageUrl && (
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 mb-1">
                <img 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <span className="text-center text-xs font-medium text-white truncate w-full">{item.title}</span>
            <span 
              className={`text-[10px] px-1.5 py-0.5 rounded-full mt-1 ${
                item.type === 'clue' ? 'bg-cyan-900/30 text-cyan-400' :
                item.type === 'location' ? 'bg-green-900/30 text-green-400' :
                item.type === 'person' ? 'bg-amber-900/30 text-amber-400' :
                'bg-purple-900/30 text-purple-400'
              }`}
            >
              {item.type}
            </span>
          </motion.div>
        ))}
        
        <div className="absolute bottom-2 right-2">
          <div className="text-xs text-white/30 flex items-center">
            <ArrowUpRight className="h-3 w-3 mr-1" /> Trascina gli elementi
          </div>
        </div>
      </div>
    </motion.div>
  );
};
