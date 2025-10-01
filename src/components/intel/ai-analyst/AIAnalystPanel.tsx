// © 2025 Joseph MULÉ – M1SSION™ - AI Analyst Panel
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Activity } from 'lucide-react';
import { useIntelAnalyst, type AnalystMode } from '@/hooks/useIntelAnalyst';
import AIEdgeGlow from './SiriWaveOverlay';

interface AIAnalystPanelProps {
  onClose: () => void;
}

const QUICK_CHIPS: Array<{ label: string; mode: AnalystMode }> = [
  { label: 'Classifica indizi', mode: 'classify' },
  { label: 'Trova pattern', mode: 'analyze' },
  { label: 'Decodifica', mode: 'decode' },
  { label: 'Valuta probabilità', mode: 'assess' },
  { label: 'Mentore', mode: 'guide' }
];

const PLACEHOLDERS = [
  "Analizza gli indizi raccolti...",
  "Cosa significano questi pattern?",
  "Trova correlazioni tra i dati...",
  "Decodifica questo messaggio...",
  "Quali sono le probabilità?"
];

const AIAnalystPanel: React.FC<AIAnalystPanelProps> = ({ onClose }) => {
  const { messages, isProcessing, status, sendMessage } = useIntelAnalyst();
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
      sendMessage(input, mode);
      setInput('');
    }
  };

  const handleQuickAction = (mode: AnalystMode) => {
    const message = mode === 'decode' ? 'decode' : `Esegui ${mode}`;
    sendMessage(message, mode);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Siri Edge Glow */}
      <AIEdgeGlow status={status} isActive={true} />
      
      {/* Panel */}
      <div className="fixed inset-4 md:inset-8 z-50 flex items-center justify-center">
        <div 
          className="w-full max-w-4xl h-full max-h-[800px] bg-black/90 backdrop-blur-xl rounded-2xl flex flex-col"
          style={{
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
                  M1SSION AI Analyst
                </h2>
                <p className="text-sm text-white/60 mt-1">Intelligence Analysis System</p>
              </div>
              
              {/* VU Meter */}
              {status === 'speaking' && (
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="w-1 bg-gradient-to-t from-[#00E5FF] to-[#F213A4] rounded-full animate-pulse"
                      style={{
                        height: `${12 + Math.random() * 20}px`,
                        animationDelay: `${i * 100}ms`,
                        animationDuration: '600ms'
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white/80" />
            </button>
          </div>
          
          {/* Quick Action Chips */}
          <div className="px-6 py-4 border-b border-white/10 flex gap-2 flex-wrap">
            {QUICK_CHIPS.map((chip) => (
              <button
                key={chip.mode}
                onClick={() => handleQuickAction(chip.mode)}
                disabled={isProcessing}
                className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(135deg, rgba(242, 19, 164, 0.15), rgba(0, 229, 255, 0.15))',
                  border: '1px solid rgba(0, 229, 255, 0.3)',
                  color: 'rgba(255, 255, 255, 0.9)'
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.length === 0 ? (
              <div className="text-center text-white/40 py-12">
                <Activity className="w-16 h-16 mx-auto mb-4 opacity-40" />
                <p className="text-lg mb-2">🎯 Intelligence Analyst Ready</p>
                <p className="text-sm">Use quick chips above or type your query below.</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-4 rounded-2xl ${
                      message.role === 'user'
                        ? 'bg-gradient-to-br from-[#F213A4]/20 to-[#0EA5E9]/20 border border-[#F213A4]/30'
                        : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <div className="text-sm text-white/90 whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </div>
                    {message.metadata && message.metadata.cluesAnalyzed !== undefined && (
                      <div className="mt-2 text-xs text-white/40">
                        {message.metadata.cluesAnalyzed} indizi analizzati • {message.metadata.mode}
                      </div>
                    )}
                  </div>
                </div>
              ))
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