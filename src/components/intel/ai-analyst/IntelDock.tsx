// © 2025 Joseph MULÉ – M1SSION™ - Bottom Dock Controls
import React, { useState } from 'react';
import { Video, Mic, MicOff, MoreHorizontal, MessageSquare, Volume2, Palette } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface IntelDockProps {
  onMicToggle: () => void;
  micEnabled: boolean;
  ttsEnabled: boolean;
  onOpenPanel: () => void;
}

const IntelDock: React.FC<IntelDockProps> = ({
  onMicToggle,
  micEnabled,
  ttsEnabled,
  onOpenPanel
}) => {
  const [videoEnabled] = useState(false);

  const DockButton: React.FC<{
    icon: React.ReactNode;
    active?: boolean;
    onClick?: () => void;
    label: string;
  }> = ({ icon, active, onClick, label }) => (
    <button
      onClick={onClick}
      className={`
        w-14 h-14 rounded-full flex items-center justify-center
        backdrop-blur-xl border border-white/10
        transition-all duration-200
        hover:scale-105 active:scale-95
        ${active 
          ? 'bg-cyan-500/30 text-cyan-300 shadow-lg shadow-cyan-500/20' 
          : 'bg-black/40 text-white/70 hover:bg-black/60 hover:text-white/90'
        }
      `}
      aria-label={label}
      aria-pressed={active}
    >
      {icon}
    </button>
  );

  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center gap-4 px-6 py-4 rounded-full bg-black/60 backdrop-blur-xl border border-white/5">
        {/* Video Toggle (placeholder) */}
        <DockButton
          icon={<Video className="w-5 h-5" />}
          active={videoEnabled}
          label="Toggle video"
        />

        {/* Mic Toggle */}
        <DockButton
          icon={micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          active={micEnabled}
          onClick={onMicToggle}
          label="Toggle microphone"
        />

        {/* More Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="w-14 h-14 rounded-full flex items-center justify-center bg-black/40 backdrop-blur-xl border border-white/10 text-white/70 hover:bg-black/60 hover:text-white/90 transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="More options"
            >
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="center" 
            side="top"
            className="bg-black/90 backdrop-blur-xl border-white/10 text-white/90 mb-2"
          >
            <DropdownMenuItem onClick={onOpenPanel} className="gap-2 cursor-pointer">
              <MessageSquare className="w-4 h-4" />
              <span>Apri Pannello</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Volume2 className="w-4 h-4" />
              <span>{ttsEnabled ? 'Disattiva' : 'Attiva'} Voce</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="gap-2 cursor-pointer">
              <Palette className="w-4 h-4" />
              <span>Tema Orb</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default IntelDock;
