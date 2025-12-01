// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Intel Chat Panel - AION Communication Interface with M1U Logic

import React, { useState, useRef, useEffect, RefObject } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, RotateCw, MoreHorizontal, Loader2, Brain, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTTS } from '@/components/intel/hooks/useTTS';
import type { AionEntityHandle, Viseme } from '@/components/aion/AionEntity';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system' | 'error';
  content: string;
  timestamp: Date;
  meta?: {
    m1u_spent?: number;
    free_remaining?: number;
    error_code?: string;
  };
}

interface AionStatus {
  plan: string;
  m1u_balance: number;
  free_remaining: number;
  cost_per_consult: number;
}

interface IntelChatPanelProps {
  aionEntityRef?: RefObject<AionEntityHandle>;
  className?: string;
}

// Error messages mapping (lore-friendly)
const ERROR_MESSAGES: Record<string, string> = {
  'INSUFFICIENT_M1U_FOR_AION': '⚡ Energia M1U insufficiente per attivare il canale AION. Ricarica le tue unità per continuare.',
  'AION_DAILY_CAP_EXCEEDED': '🔒 Limite giornaliero AION raggiunto. Il canale si ricaricherà domani. Riprova più tardi.',
  'NOT_AUTHENTICATED': '🔐 Connessione neurale non autenticata. Effettua il login per accedere ad AION.',
  'INTERNAL_ERROR': '⚠️ Interferenza nel canale. Riprova tra qualche secondo.',
};

const IntelChatPanel: React.FC<IntelChatPanelProps> = ({ aionEntityRef, className = '' }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'system-1',
      role: 'system',
      content: 'Connessione neurale stabilizzata. Sono AION, la tua intelligenza adattiva.',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMicEnabled, setIsMicEnabled] = useState(true); // ON by default - AION must speak!
  const [status, setStatus] = useState<'idle' | 'listening' | 'speaking'>('idle');
  const [aionStatus, setAionStatus] = useState<AionStatus | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionIdRef = useRef<string>(`session_${Date.now()}`);
  
  const { speak, stop: stopTTS, isSpeaking } = useTTS();

  // Fetch AION status on mount
  useEffect(() => {
    fetchAionStatus();
  }, []);

  const fetchAionStatus = async () => {
    try {
      const { data, error } = await supabase.rpc('get_aion_status');
      if (!error && data) {
        setAionStatus(data as AionStatus);
      } else if (error) {
        // RPC doesn't exist yet - use default FREE plan status
        console.warn('[AION] get_aion_status not found, using defaults:', error.message);
        setAionStatus({
          plan: 'FREE',
          m1u_balance: 0,
          free_remaining: 0,
          cost_per_consult: 2
        });
      }
    } catch (e) {
      console.error('[AION] Status fetch error:', e);
      // Fallback to defaults
      setAionStatus({
        plan: 'FREE',
        m1u_balance: 0,
        free_remaining: 0,
        cost_per_consult: 2
      });
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Generate visemes from text (vowels → timing)
  const generateVisemes = (text: string): Viseme[] => {
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    const visemes: Viseme[] = [];
    let time = 0;
    const interval = 120;

    for (const char of text.toLowerCase()) {
      if (vowels.includes(char)) {
        visemes.push({ t: time, v: char.toUpperCase() });
        time += interval;
      } else if (char === 'm' || char === 'n' || char === 'b' || char === 'p') {
        visemes.push({ t: time, v: 'M' });
        time += interval * 0.8;
      } else if (char === ' ') {
        time += interval * 0.5;
      } else {
        time += interval * 0.3;
      }
    }

    return visemes;
  };

  // Send message to AION
  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setStatus('listening');

    try {
      // Call norah-chat-v2 edge function
      const { data, error } = await supabase.functions.invoke('norah-chat-v2', {
        body: {
          session_id: sessionIdRef.current,
          text: userMessage.content,
          messages: messages.filter(m => m.role !== 'system' && m.role !== 'error').slice(-10),
          system: 'AION_CLIENT'
        }
      });

      if (error) throw error;

      // Check if access was denied (only if RPC is working)
      if (data?.authorized === false && data?.error_code !== 'NOT_AUTHENTICATED') {
        const errorCode = data.error_code || 'INTERNAL_ERROR';
        const errorMessage = ERROR_MESSAGES[errorCode] || data.message || 'Accesso AION non autorizzato.';
        
        const errorMsg: Message = {
          id: `error_${Date.now()}`,
          role: 'error',
          content: errorMessage,
          timestamp: new Date(),
          meta: {
            error_code: errorCode,
            m1u_spent: 0,
            free_remaining: data.free_remaining
          }
        };
        
        setMessages(prev => [...prev, errorMsg]);
        setStatus('idle');
        
        // Update status to reflect new balance
        if (data.m1u_balance !== undefined) {
          setAionStatus(prev => prev ? { ...prev, m1u_balance: data.m1u_balance } : null);
        }
        
        return;
      }
      
      // If RPC doesn't exist yet, just process the reply normally
      if (data?.authorized === false && data?.error_code === 'NOT_AUTHENTICATED') {
        console.warn('[AION] RPC check_aion_access may not exist yet, proceeding anyway');
      }

      // Success - process reply
      let reply = data?.reply || 'Mi dispiace, non ho capito. Riprova.';
      reply = reply
        .replace(/\bION\b/g, 'AION')
        .replace(/Sono Ion/gi, 'Sono AION')
        .replace(/sono ion/gi, 'sono AION')
        .replace(/chiamo Ion/gi, 'chiamo AION');
      
      const visemes = data?.visemes || generateVisemes(reply);

      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
        meta: {
          m1u_spent: data?.access?.m1u_spent,
          free_remaining: data?.access?.free_remaining
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
      setStatus('speaking');

      // Update AION status after successful call
      if (data?.access) {
        setAionStatus(prev => prev ? {
          ...prev,
          m1u_balance: data.access.m1u_balance,
          free_remaining: data.access.free_remaining
        } : null);
        
        // Dispatch M1U spent event if applicable
        if (data.access.m1u_spent > 0) {
          window.dispatchEvent(new CustomEvent('m1u-spent', { 
            detail: { amount: data.access.m1u_spent } 
          }));
        }
      }

      // Trigger AION animation
      if (aionEntityRef?.current) {
        aionEntityRef.current.play(visemes);
      }

      // TTS con ElevenLabs (voce naturale) - only if mic/speaker enabled
      if (isMicEnabled) {
        speak(reply, {
          useCloud: true,
          voice: 'callum',
          onEnd: () => {
            setStatus('idle');
            aionEntityRef?.current?.idle();
          }
        });
      } else {
        // No TTS, just reset status
        setTimeout(() => {
          setStatus('idle');
          aionEntityRef?.current?.idle();
        }, 500);
      }

    } catch (error) {
      console.error('[AION] Chat error:', error);
      
      const fallbackMessage: Message = {
        id: `error_${Date.now()}`,
        role: 'error',
        content: '⚠️ Interferenza nel canale. Riprova tra qualche secondo.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, fallbackMessage]);
      setStatus('idle');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Toggle mic
  const toggleMic = () => {
    setIsMicEnabled(prev => !prev);
  };

  // Refresh chat
  const refreshChat = () => {
    sessionIdRef.current = `session_${Date.now()}`;
    setMessages([{
      id: 'system-1',
      role: 'system',
      content: 'Connessione neurale ripristinata. Sono AION, pronto ad assisterti.',
      timestamp: new Date()
    }]);
    stopTTS();
    aionEntityRef?.current?.idle();
    setStatus('idle');
    fetchAionStatus();
  };

  return (
    <div className={`flex flex-col rounded-2xl overflow-hidden ${className}`}
      style={{
        background: 'rgba(7, 8, 24, 0.6)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(0, 212, 255, 0.2)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-500/20">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-cyan-400" />
          <span className="text-sm font-medium text-white">Neural Link Established</span>
          <span className={`w-2 h-2 rounded-full ${status === 'idle' ? 'bg-green-400' : status === 'speaking' ? 'bg-cyan-400 animate-pulse' : 'bg-yellow-400 animate-pulse'}`} />
        </div>
        <div className="flex items-center gap-2">
          {/* AION Status Info */}
          {aionStatus && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-800/50 text-xs">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span className="text-gray-400">
                {aionStatus.free_remaining > 0 
                  ? `${aionStatus.free_remaining} gratis`
                  : `${aionStatus.cost_per_consult} M1U`
                }
              </span>
            </div>
          )}
          <button
            onClick={toggleMic}
            className={`p-2 rounded-lg transition-colors ${isMicEnabled ? 'bg-cyan-500/20 text-cyan-400' : 'text-gray-400 hover:text-white'}`}
          >
            {isMicEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>
          <button
            onClick={refreshChat}
            className="p-2 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg text-gray-400 hover:text-white transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-80 min-h-[200px]"
        style={{ scrollBehavior: 'smooth' }}
      >
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                    : message.role === 'system'
                    ? 'bg-gray-800/50 text-gray-400 italic text-sm'
                    : message.role === 'error'
                    ? 'bg-red-900/30 text-red-300 border border-red-500/30'
                    : 'bg-gray-800/80 text-white border border-cyan-500/20'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                {/* Show M1U spent info */}
                {message.meta?.m1u_spent !== undefined && message.meta.m1u_spent > 0 && (
                  <p className="text-xs text-cyan-400/70 mt-1">
                    -{message.meta.m1u_spent} M1U
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-gray-800/80 px-4 py-2 rounded-2xl border border-cyan-500/20">
              <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Status */}
      <div className="px-4 py-2 text-xs text-center text-gray-500">
        {status === 'listening' && 'Elaborazione...'}
        {status === 'speaking' && 'AION sta parlando...'}
        {status === 'idle' && 'In attesa...'}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-cyan-500/20">
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Scrivi un messaggio..."
            disabled={isLoading}
            className="flex-1 bg-gray-800/50 border border-cyan-500/20 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-cyan-500/25 transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntelChatPanel;
