// © 2025 Joseph MULÉ – M1SSION™ - AI Analyst Panel
import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Brain } from 'lucide-react';
import { useIntelAnalyst } from '@/hooks/useIntelAnalyst';
import SiriWaveOverlay from './SiriWaveOverlay';

interface AIAnalystPanelProps {
  onClose: () => void;
}

const AIAnalystPanel: React.FC<AIAnalystPanelProps> = ({ onClose }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, isProcessing, voiceEnergy, sendMessage } = useIntelAnalyst();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;
    
    await sendMessage(input);
    setInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <SiriWaveOverlay energy={voiceEnergy} isActive={isProcessing} />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
        <div className="w-full max-w-4xl h-[80vh] m-4 bg-black/90 backdrop-blur-xl rounded-2xl border-2 border-[#F213A4]/30 shadow-[0_0_50px_rgba(242,19,164,0.3)] flex flex-col">
          
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F213A4] to-[#0EA5E9] flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">AI ANALYST</h2>
                <p className="text-xs text-white/60">M1SSION Intelligence Support</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-white/60 mt-8">
                <Brain className="w-16 h-16 mx-auto mb-4 text-[#F213A4]" />
                <p className="text-lg mb-2">Welcome, Agent</p>
                <p className="text-sm">I can help you with:</p>
                <div className="mt-4 space-y-2 text-left max-w-md mx-auto">
                  <div className="p-2 bg-white/5 rounded">• Analyze your collected clues</div>
                  <div className="p-2 bg-white/5 rounded">• Classify and organize intel</div>
                  <div className="p-2 bg-white/5 rounded">• Decode basic ciphers</div>
                  <div className="p-2 bg-white/5 rounded">• Assess tactical probabilities</div>
                  <div className="p-2 bg-white/5 rounded">• Provide strategic guidance</div>
                </div>
              </div>
            )}
            
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-[#F213A4] to-[#FF4D4D] text-white'
                      : 'bg-white/10 text-white border border-white/20'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  {msg.metadata && (
                    <div className="mt-2 pt-2 border-t border-white/20 text-xs opacity-60">
                      {msg.metadata.probability && (
                        <div>Probability: {msg.metadata.probability}</div>
                      )}
                      {msg.metadata.risk && (
                        <div>Risk Level: {msg.metadata.risk}</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-white/10 text-white border border-white/20 p-3 rounded-lg">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-[#F213A4] rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-[#FF4D4D] rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-[#0EA5E9] rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask the Analyst..."
                disabled={isProcessing}
                className="flex-1 bg-white/10 text-white placeholder-white/40 px-4 py-3 rounded-lg border border-white/20 focus:border-[#F213A4] focus:outline-none disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isProcessing}
                className="w-12 h-12 bg-gradient-to-br from-[#F213A4] to-[#0EA5E9] rounded-lg flex items-center justify-center hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Send"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIAnalystPanel;
