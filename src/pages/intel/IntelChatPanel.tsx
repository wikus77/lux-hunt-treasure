// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Intel Chat Panel - AION Communication Interface with M1U Logic
// 🔧 FIX v11 (22/01/2026): Unified KeyboardDock for iOS keyboard handling

import React, { useState, useRef, useEffect, RefObject } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, MicOff, RotateCw, MoreHorizontal, Loader2, Brain, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useTTS } from '@/components/intel/hooks/useTTS';
import { useCashbackWallet } from '@/hooks/useCashbackWallet'; // 🆕 M1SSION Cashback Vault™
import { useAionDynamicIsland } from '@/hooks/useAionDynamicIsland'; // 🎙️ DI SOLO per AION
import type { AionEntityHandle, Viseme } from '@/components/aion/AionEntity';
import { useKeyboardInset } from '@/hooks/useKeyboardInset'; // 🔧 FIX v12: For keyboard positioning

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
  style?: React.CSSProperties;
}

// Error messages mapping (lore-friendly)
const ERROR_MESSAGES: Record<string, string> = {
  'INSUFFICIENT_M1U_FOR_AION': '⚡ Energia M1U insufficiente per attivare il canale AION. Ricarica le tue unità per continuare.',
  'AION_DAILY_CAP_EXCEEDED': '🔒 Limite giornaliero AION raggiunto. Il canale si ricaricherà domani. Riprova più tardi.',
  'NOT_AUTHENTICATED': '🔐 Connessione neurale non autenticata. Effettua il login per accedere ad AION.',
  'AUTH_ERROR': '🔐 Errore di autenticazione. Effettua nuovamente il login.',
  'RPC_UNAVAILABLE': '⚙️ Sistema di billing temporaneamente non disponibile. Riprova tra qualche secondo.',
  'INTERNAL_ERROR': '⚠️ Interferenza nel canale. Riprova tra qualche secondo.',
};

const IntelChatPanel: React.FC<IntelChatPanelProps> = ({ aionEntityRef, className = '', style }) => {
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
  // 🔍 OBSERVABILITY: Retry tracking for 503 errors
  const [retryCount, setRetryCount] = useState(0);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const MAX_RETRY_COUNT = 3;
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sessionIdRef = useRef<string>(`session_${Date.now()}`);
  
  // 🔧 FIX v11: Use unified keyboard inset hook
  const { isOpen: isKeyboardOpen, inset: keyboardInset } = useKeyboardInset();
  
  const { speak, stop: stopTTS, isSpeaking, unlockAudio } = useTTS();
  const { accrueFromAion } = useCashbackWallet(); // 🆕 M1SSION Cashback Vault™
  
  // 🎙️ Dynamic Island SOLO quando AION parla (non per video/suoni)
  useAionDynamicIsland({
    isSpeaking,
    status,
    isPanelOpen: true // Questo pannello è sempre "open" quando visibile
  });

  // 🍎 iOS: Unlock audio on first user interaction with chat
  useEffect(() => {
    const unlockOnInteraction = () => {
      unlockAudio();
    };
    // Listen for any interaction in the chat panel
    document.addEventListener('touchstart', unlockOnInteraction, { once: true, passive: true });
    document.addEventListener('click', unlockOnInteraction, { once: true, passive: true });
    return () => {
      document.removeEventListener('touchstart', unlockOnInteraction);
      document.removeEventListener('click', unlockOnInteraction);
    };
  }, [unlockAudio]);

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
  // 🔍 OBSERVABILITY: Added isRetry parameter for retry tracking
  const sendMessage = async (isRetry: boolean = false, retryText?: string) => {
    const messageText = isRetry && retryText ? retryText : input.trim();
    if (!messageText || isLoading) return;

    // 🍎 iOS: Force unlock audio when user sends message (user gesture context)
    unlockAudio();

    // Only add user message bubble if not a retry (retry reuses last message)
    if (!isRetry) {
      const userMessage: Message = {
        id: `user_${Date.now()}`,
        role: 'user',
        content: messageText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      setInput('');
      setLastFailedMessage(null);
      setRetryCount(0);
    }

    setIsLoading(true);
    setStatus('listening');

    try {
      // 🔍 OBSERVABILITY: Track retry attempts
      const currentRetry = isRetry ? retryCount + 1 : 0;
      if (isRetry) {
        setRetryCount(currentRetry);
        console.log(`[AION] Retry attempt ${currentRetry}/${MAX_RETRY_COUNT}`);
      }

      // Call norah-chat-v2 edge function
      const { data, error } = await supabase.functions.invoke('norah-chat-v2', {
        body: {
          session_id: sessionIdRef.current,
          text: messageText,
          messages: messages.filter(m => m.role !== 'system' && m.role !== 'error').slice(-10),
          system: 'AION_CLIENT',
          // 🔍 OBSERVABILITY: Include retry metadata
          is_retry: isRetry,
          retry_attempt: currentRetry
        }
      });

      if (error) throw error;

      // 🔒 HARDENED: Check if access was denied (ALL cases, no bypass)
      if (data?.authorized === false) {
        const errorCode = data.error_code || 'INTERNAL_ERROR';
        const errorMessage = ERROR_MESSAGES[errorCode] || data.message || 'Accesso AION non autorizzato.';
        
        // 🔍 OBSERVABILITY: Track 503/RPC_UNAVAILABLE for retry
        const isRetryableError = errorCode === 'RPC_UNAVAILABLE' || errorCode === 'INTERNAL_ERROR';
        if (isRetryableError) {
          setLastFailedMessage(messageText);
        }
        
        const errorMsg: Message = {
          id: `error_${Date.now()}`,
          role: 'error',
          content: errorMessage,
          timestamp: new Date(),
          meta: {
            error_code: errorCode,
            m1u_spent: 0,
            free_remaining: data.free_remaining,
            // 🔍 OBSERVABILITY: Include retry info in error message
            can_retry: isRetryableError && retryCount < MAX_RETRY_COUNT,
            retry_attempt: isRetry ? retryCount + 1 : 0
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
      
      // 🔍 OBSERVABILITY: Clear retry state on success
      setLastFailedMessage(null);
      setRetryCount(0);

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
          
          // 🆕 M1SSION Cashback Vault™ - Accumula cashback (1 M1U = €0.10)
          const costEur = data.access.m1u_spent / 10;
          accrueFromAion({ costEur });
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
      
      // 🔍 OBSERVABILITY: Track catch errors for retry
      setLastFailedMessage(messageText);
      
      const fallbackMessage: Message = {
        id: `error_${Date.now()}`,
        role: 'error',
        content: '⚠️ Interferenza nel canale. Riprova tra qualche secondo.',
        timestamp: new Date(),
        meta: {
          error_code: 'NETWORK_ERROR',
          can_retry: retryCount < MAX_RETRY_COUNT,
          retry_attempt: isRetry ? retryCount + 1 : 0
        }
      };
      setMessages(prev => [...prev, fallbackMessage]);
      setStatus('idle');
    } finally {
      setIsLoading(false);
    }
  };

  // 🔍 OBSERVABILITY: Retry handler for 503/network errors
  const handleRetry = () => {
    if (lastFailedMessage && retryCount < MAX_RETRY_COUNT) {
      console.log(`[AION] User initiated retry for: "${lastFailedMessage.substring(0, 50)}..."`);
      sendMessage(true, lastFailedMessage);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter o Cmd+Enter = invia messaggio
    // Enter semplice = nuova riga (comportamento default textarea)
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
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

  // 🔧 FIX 30/01/2026: Changed to WHITE glass theme (was dark rgba(7,8,24,0.6))
  return (
    <div className={`flex flex-col rounded-2xl overflow-hidden sn-chat-container ${className}`}
      style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
        // 🔧 FIX v10: Remove marginBottom - we'll handle keyboard in input bar
        ...style
      }}
    >
      {/* Header - WHITE theme */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200/60">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-cyan-600" />
          <span className="text-sm font-medium text-gray-800">Neural Link Established</span>
          <span className={`w-2 h-2 rounded-full ${status === 'idle' ? 'bg-green-500' : status === 'speaking' ? 'bg-cyan-500 animate-pulse' : 'bg-yellow-500 animate-pulse'}`} />
        </div>
        <div className="flex items-center gap-2">
          {/* AION Status Info */}
          {aionStatus && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-gray-100 text-xs border border-gray-200/60">
              <Zap className="w-3 h-3 text-yellow-500" />
              <span className="text-gray-600">
                {aionStatus.free_remaining > 0 
                  ? `${aionStatus.free_remaining} gratis`
                  : `${aionStatus.cost_per_consult} M1U`
                }
              </span>
            </div>
          )}
          <button
            onClick={toggleMic}
            className={`p-2 rounded-lg transition-colors ${isMicEnabled ? 'bg-cyan-100 text-cyan-600' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}
          >
            {isMicEnabled ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>
          <button
            onClick={refreshChat}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages - 🔧 FIX v11: Add padding when keyboard open (input bar is in portal) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]"
        style={{ 
          scrollBehavior: 'smooth',
          WebkitOverflowScrolling: 'touch',
          // 🔧 FIX v11: Extra padding when keyboard is open (input bar rendered via portal)
          paddingBottom: isKeyboardOpen ? `${keyboardInset + 80}px` : '80px',
        }}
      >
        {/* 🔧 FIX 30/01/2026: WHITE theme message bubbles */}
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
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md'
                    : message.role === 'system'
                    ? 'bg-gray-100 text-gray-500 italic text-sm border border-gray-200/60'
                    : message.role === 'error'
                    ? 'bg-red-50 text-red-600 border border-red-200 relative'
                    : 'bg-gray-100 text-gray-800 border border-gray-200/60 shadow-sm'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                {/* Show M1U spent info */}
                {message.meta?.m1u_spent !== undefined && message.meta.m1u_spent > 0 && (
                  <p className="text-xs text-cyan-600/70 mt-1">
                    -{message.meta.m1u_spent} M1U
                  </p>
                )}
                {/* 🔍 OBSERVABILITY: Retry button for recoverable errors */}
                {message.role === 'error' && message.meta?.can_retry && lastFailedMessage && retryCount < MAX_RETRY_COUNT && (
                  <button
                    onClick={handleRetry}
                    disabled={isLoading}
                    className="mt-2 px-3 py-1.5 text-xs bg-cyan-100 hover:bg-cyan-200 text-cyan-700 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <RotateCw className="w-3 h-3" />
                    Riprova ({MAX_RETRY_COUNT - retryCount} tentativi)
                  </button>
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
            <div className="bg-gray-100 px-4 py-2 rounded-2xl border border-gray-200/60 shadow-sm">
              <Loader2 className="w-5 h-5 text-cyan-600 animate-spin" />
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Status - UX Resilience: Clear status messages */}
      <div className="px-4 py-2 text-xs text-center text-gray-500">
        {status === 'listening' && '⚡ Verifica accesso in corso...'}
        {status === 'speaking' && '🔊 AION sta parlando...'}
        {status === 'idle' && '✨ Pronto'}
      </div>

      {/* Input - 🔧 FIX v13: Same keyboard anchoring as Chat
          CRITICAL: iOS requires the same DOM node to maintain focus session
          🔧 FIX 30/01/2026: WHITE theme styling */}
      <div 
        style={{
          position: 'fixed',
          left: '8px',
          right: '8px',
          // 🔧 FIX v13: Stesso ancoraggio tastiera del Chat - più in basso quando chiusa
          bottom: isKeyboardOpen ? `${keyboardInset + 8}px` : '100px',
          zIndex: 60000,
          transition: 'bottom 0.15s ease-out',
          // WHITE Glass style
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 209, 255, 0.2)',
          borderRadius: '16px',
          boxShadow: '0 -4px 24px rgba(0, 0, 0, 0.08), 0 0 20px rgba(0, 209, 255, 0.1)',
          padding: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            onKeyDown={handleKeyPress}
            placeholder="Scrivi un messaggio..."
            disabled={isLoading}
            rows={1}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="sentences"
            spellCheck={false}
            inputMode="text"
            data-form-type="other"
            data-lpignore="true"
            data-chat-input="true"
            style={{
              flex: 1,
              background: 'rgba(243, 244, 246, 0.9)',
              border: '1px solid rgba(0, 209, 255, 0.2)',
              borderRadius: '12px',
              padding: '10px 16px',
              color: '#1F2937',
              fontSize: '15px',
              maxHeight: '120px',
              minHeight: '40px',
              resize: 'none',
              overflowY: 'auto',
              outline: 'none',
              WebkitAppearance: 'none',
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isLoading}
            style={{
              padding: '10px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00D1FF 0%, #3B82F6 100%)',
              border: 'none',
              cursor: !input.trim() || isLoading ? 'not-allowed' : 'pointer',
              opacity: !input.trim() || isLoading ? 0.5 : 1,
              boxShadow: '0 4px 12px rgba(0, 209, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Send style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntelChatPanel;
