// © 2025 Joseph MULÉ – M1SSION™ - AI Analyst Main Panel
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Sparkles, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useIntelAnalyst } from '@/hooks/useIntelAnalyst';
import AIAnalystWave from './AIAnalystWave';

interface AIAnalystPanelProps {
  onClose: () => void;
}

const AIAnalystPanel: React.FC<AIAnalystPanelProps> = ({ onClose }) => {
  const [input, setInput] = useState('');
  const { messages, isProcessing, sendMessage, voiceEnergy } = useIntelAnalyst();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;
    
    const msg = input.trim();
    setInput('');
    await sendMessage(msg);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <AIAnalystWave energy={voiceEnergy} isActive={isProcessing} />
      
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-4xl h-[80vh] bg-gradient-to-br from-black/95 via-[#0A0A1A]/95 to-black/95 border-2 border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(14,165,233,0.3)] flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-cyan-500/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F213A4] via-[#FF4D4D] to-[#0EA5E9] flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  AI ANALYST
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                </h2>
                <p className="text-xs text-cyan-400/80">M1SSION Intelligence Assistant</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.length === 0 && (
                <div className="text-center py-12">
                  <Shield className="w-16 h-16 mx-auto mb-4 text-cyan-400/50" />
                  <p className="text-white/60 text-sm mb-2">AI Analyst Ready</p>
                  <p className="text-white/40 text-xs max-w-md mx-auto">
                    I can analyze your clues, classify them, detect patterns, decode basic ciphers, 
                    and provide tactical insights. I never reveal locations or prizes directly.
                  </p>
                </div>
              )}
              
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 text-white'
                        : 'bg-gradient-to-br from-[#F213A4]/10 to-[#FF4D4D]/10 border border-[#F213A4]/30 text-white'
                    }`}
                  >
                    {msg.role === 'analyst' && msg.content.includes('⚠️') && (
                      <div className="flex items-start gap-2 mb-2 text-yellow-400/80 text-xs">
                        <AlertTriangle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                        <span>Classification: Tactical Analysis</span>
                      </div>
                    )}
                    <div className="whitespace-pre-wrap text-sm leading-relaxed">
                      {msg.content}
                    </div>
                    <div className="text-xs text-white/40 mt-2">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              
              {isProcessing && (
                <div className="flex justify-start">
                  <div className="bg-gradient-to-br from-[#F213A4]/10 to-[#FF4D4D]/10 border border-[#F213A4]/30 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2 text-cyan-400">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs">Analyzing...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t border-cyan-500/20">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask for analysis, classification, or decoding..."
                disabled={isProcessing}
                className="flex-1 bg-black/50 border-cyan-500/30 text-white placeholder:text-white/40 focus:border-cyan-500/60"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isProcessing}
                className="bg-gradient-to-r from-[#F213A4] to-[#FF4D4D] hover:opacity-80 text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-white/40 mt-2 text-center">
              ⚠️ AI Analyst provides tactical insights only. Never reveals final locations or prizes.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIAnalystPanel;
