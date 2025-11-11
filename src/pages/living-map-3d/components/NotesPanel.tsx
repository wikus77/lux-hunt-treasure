/**
 * Notes Panel - Collapsible note-taking panel for Living Map 3D
 */
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, X } from 'lucide-react';

const NotesPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 left-4 z-90 bg-[rgba(5,14,22,0.95)] border-[rgba(10,239,255,0.4)] hover:bg-[rgba(10,239,255,0.15)] backdrop-blur-md"
        style={{
          borderRadius: '12px',
          padding: '12px 20px',
          boxShadow: '0 0 25px rgba(10, 239, 255, 0.3)',
        }}
        title="Note"
      >
        <FileText className="w-5 h-5 mr-2" style={{ filter: 'drop-shadow(0 0 4px rgba(10, 239, 255, 0.8))' }} />
        <span className="font-orbitron text-sm" style={{ color: '#0AEFFF', textShadow: '0 0 8px rgba(10, 239, 255, 0.6)' }}>
          Note
        </span>
      </Button>

      {/* Panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 left-4 z-95 bg-[rgba(5,14,22,0.95)] border border-[rgba(10,239,255,0.4)] backdrop-blur-md"
          style={{
            width: '300px',
            maxHeight: '400px',
            borderRadius: '12px',
            boxShadow: '0 0 30px rgba(10, 239, 255, 0.4)',
            padding: '16px',
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-orbitron text-sm font-semibold" style={{ color: '#0AEFFF', textShadow: '0 0 8px rgba(10, 239, 255, 0.6)' }}>
              Note Mappa
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="h-6 w-6 p-0 hover:bg-[rgba(10,239,255,0.1)]"
            >
              <X className="w-4 h-4" style={{ color: '#0AEFFF' }} />
            </Button>
          </div>

          {/* Content */}
          <textarea
            placeholder="Scrivi le tue note qui..."
            className="w-full h-64 p-3 bg-[rgba(0,0,0,0.5)] border border-[rgba(10,239,255,0.2)] rounded-lg resize-none focus:outline-none focus:border-[rgba(10,239,255,0.5)] font-sans text-sm"
            style={{
              color: 'rgba(255, 255, 255, 0.9)',
            }}
          />
        </div>
      )}
    </>
  );
};

export default NotesPanel;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
