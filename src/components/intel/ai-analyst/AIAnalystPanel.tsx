// © 2025 Joseph MULÉ – M1SSION™ - AI Analyst Panel
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Activity } from 'lucide-react';
import { type AnalystMode, type AnalystStatus, type AnalystMessage } from '@/hooks/useIntelAnalyst';
import AIEdgeGlow from './SiriWaveOverlay';
import { type AgentContextData } from '@/intel/ai/context/agentContext';

export interface AIAnalystPanelProps {
  // Support both 'open' and 'isOpen' for compatibility
  open?: boolean;
  isOpen?: boolean;
  onClose: () => void;
  messages: AnalystMessage[];
  isProcessing: boolean;
  onSendMessage: (msg: string, mode: AnalystMode) => Promise<void>;
  currentMode: AnalystMode;
  cluesCount?: number;
  status: AnalystStatus;
  audioLevel: number;
  ttsEnabled: boolean;
  onToggleTTS: () => void;
  agentContext?: AgentContextData | null;
  showChips?: boolean; // v4: hide chips by default
}

const QUICK_CHIPS: Array<{ label: string; mode: AnalystMode }> = [
  { label: 'Classifica indizi', mode: 'classify' },
  { label: 'Trova pattern', mode: 'analyze' },
  { label: 'Decodifica', mode: 'decode' },
  { label: 'Valuta probabilità', mode: 'assess' },
  { label: 'Mentore', mode: 'guide' }
];

// PATCH v6.1: Dynamic placeholders from NBA
const PLACEHOLDERS = [
  "Scrivi in linguaggio naturale (es. non ho capito final shot)",
  "finalshot?",
  "buzz map",
  "piani?",
  "come inizio?",
  "si paga il buzz?"
];

const AIAnalystPanel: React.FC<AIAnalystPanelProps> = (props) => { 
  // Handle both 'open' and 'isOpen' for backward compatibility
  const isOpen = props.open ?? props.isOpen ?? false;
  const {
    onClose, 
    messages, 
    isProcessing, 
    onSendMessage,
    currentMode,
    status, 
    audioLevel, 
    ttsEnabled, 
    onToggleTTS,
    agentContext,
    showChips = false // v4: hide chips by default
  } = props;
  
  const [input, setInput] = useState('');
  const [placeholder, setPlaceholder] = useState(PLACEHOLDERS[0]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Rotate placeholder
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholder(PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)]);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (mode: AnalystMode = 'analyze') => {
    if (input.trim()) {
      onSendMessage(input, mode);
      setInput('');
    }
  };

  const handleQuickAction = (mode: AnalystMode) => {
    const message = mode === 'decode' ? 'decode' : `Esegui ${mode}`;
    onSendMessage(message, mode);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Siri Edge Glow */}
      <AIEdgeGlow status={status} isActive={true} audioLevel={audioLevel} />
      
      {/* Panel */}
      <div className="fixed inset-4 md:inset-8 z-50 flex items-center justify-center">
        <div 
          className="w-full max-w-4xl h-full max-h-[800px] bg-black/90 backdrop-blur-xl flex flex-col"
          style={{
            borderRadius: '20px',
            border: '2px solid transparent',
            backgroundClip: 'padding-box',
            boxShadow: '0 0 40px rgba(242, 19, 164, 0.3), 0 0 80px rgba(0, 229, 255, 0.2), inset 0 0 60px rgba(242, 19, 164, 0.05)',
            borderImage: 'linear-gradient(135deg, rgba(0, 229, 255, 0.4), rgba(242, 19, 164, 0.4)) 1'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with VU Meter */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-[#F213A4] to-[#0EA5E9] bg-clip-text text-transparent">
                  NORAH AI
                </h2>
                <p className="text-sm text-white/60 mt-1">
                  {agentContext?.agentCode && agentContext.agentCode !== 'AG-UNKNOWN' 
                    ? `Norah Intelligence Ready • Agente ${agentContext.agentCode}`
                    : 'Norah Intelligence Ready'
                  }
                </p>
              </div>
              
              {/* VU Meter */}
              {status === 'speaking' && (
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-gradient-to-t from-[#00E5FF] to-[#F213A4] rounded-full"
                      style={{
                        height: `${12 + (ttsEnabled ? audioLevel * 30 : Math.random() * 20)}px`,
                        transition: 'height 100ms ease-out'
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={onToggleTTS}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  ttsEnabled 
                    ? 'bg-gradient-to-r from-[#F213A4] to-[#0EA5E9] text-white' 
                    : 'bg-white/10 text-white/60 hover:bg-white/20'
                }`}
              >
                {ttsEnabled ? '🔊 TTS ON' : '🔇 TTS OFF'}
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-white/80" />
              </button>
            </div>
          </div>
          
          {/* Quick Action Chips - v4.2: Removed from UI, keep handlers internal */}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 ? (
              <div className="text-center text-white/40 py-12">
                {/* © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™ */}
                <p className="text-lg mb-2">Norah Intelligence Ready</p>
                <p className="text-sm">Scrivi in linguaggio naturale. Chiedi qualsiasi cosa su M1SSION.</p>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-4 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-primary/20 border border-primary/30 text-white'
                          : 'bg-white/5 border border-white/10 text-white/90'
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                      {message.metadata && (
                        <div className="mt-2 text-xs text-white/40">
                          {message.metadata.cluesAnalyzed} indizi analizzati • {message.metadata.mode}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </>
            )}
            
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 text-white/60">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-[#F213A4] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-[#0EA5E9] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-[#F213A4] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-sm">{status === 'thinking' ? 'Processing...' : 'Speaking...'}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input with rotating placeholder */}
          <div className="p-6 border-t border-white/10">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={placeholder}
                disabled={isProcessing}
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-[#F213A4]/50 disabled:opacity-50 transition-all"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isProcessing}
                className="px-6 py-3 bg-gradient-to-r from-[#F213A4] to-[#0EA5E9] rounded-xl font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-white/30 mt-2">Press Enter to send • Shortcut: A to open/close</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIAnalystPanel;