// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Send, Activity } from 'lucide-react';
import { type AnalystMode, type AnalystStatus, type AnalystMessage } from '@/hooks/useIntelAnalyst';
import AIEdgeGlow from './SiriWaveOverlay';
import { type AgentContextData } from '@/intel/ai/context/agentContext';
import { NBAPills, type NBASuggestion } from './NBAPills';
import { nextBestActionToPills } from '@/intel/norah/engine/nextBestAction';
import { buildNorahContext } from '@/intel/norah/engine/contextBuilder';
import { logPillClick } from '@/intel/norah/utils/telemetry';
import { Celebrations, celebrateMilestone } from '@/intel/norah/ui/Celebrations';
import { useTranslation } from 'react-i18next';

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

// v4: Placeholder telegrafici per input brevi
const PLACEHOLDERS = [
  "finalshot?",
  "buzz map",
  "piani?",
  "come inizio?",
  "cosa è mission?",
  "aiuto"
];

const AIAnalystPanel: React.FC<AIAnalystPanelProps> = (props) => { 
  const { t } = useTranslation();
  
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
    agentContext
  } = props;
  
  const [input, setInput] = useState('');
  const [placeholder, setPlaceholder] = useState(PLACEHOLDERS[0]);
  const [nbaPills, setNbaPills] = useState<NBASuggestion[]>([]);
  const [celebration, setCelebration] = useState<ReturnType<typeof celebrateMilestone> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const prevCluesRef = useRef<number>(0); // © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™ – FIX v6.7

  // v6.2: Load NBA Pills on mount
  useEffect(() => {
    const loadPills = async () => {
      try {
        const ctx = await buildNorahContext();
        const pills = nextBestActionToPills(ctx);
        setNbaPills(pills);
      } catch (error) {
        console.error('[AIPanel] Failed to load NBA Pills:', error);
      }
    };
    loadPills();
  }, [messages.length]);

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

  // © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™ – v6.8
  // v6.8: Expanded celebration triggers (3rd clue added, mini-quiz support)
  const celebrationShown = useRef<string[]>([]);
  
  useEffect(() => {
    if (!agentContext) return;
    
    const currentClues = agentContext.cluesCount || 0;
    const prevClues = prevCluesRef.current;
    
    // First clue celebration
    if (prevClues === 0 && currentClues === 1) {
      setCelebration(celebrateMilestone('milestone', '🎯 Primo indizio trovato!'));
      celebrationShown.current.push('first_clue');
    }
    
    // Third clue celebration
    if (prevClues < 3 && currentClues === 3) {
      setCelebration(celebrateMilestone('discovery', '💡 3 indizi! Pattern in formazione'));
      celebrationShown.current.push('third_clue');
    }
    
    // Fifth clue celebration
    if (prevClues < 5 && currentClues === 5) {
      setCelebration(celebrateMilestone('milestone', '🌟 5 indizi raccolti! Il pattern si delinea'));
      celebrationShown.current.push('fifth_clue');
    }
    
    // Tenth clue celebration (breakthrough)
    if (prevClues < 10 && currentClues === 10) {
      setCelebration(celebrateMilestone('discovery', '🎖️ 10 indizi! Final Shot quasi pronto'));
      celebrationShown.current.push('tenth_clue');
    }
    
    prevCluesRef.current = currentClues;
  }, [agentContext?.cluesCount]);

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

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('m1-no-scroll');
    } else {
      document.body.classList.remove('m1-no-scroll');
    }
    return () => {
      document.body.classList.remove('m1-no-scroll');
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const panelContent = (
    <>
      {/* Background overlay */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[12000]"
        onClick={onClose}
      />
      
      {/* Siri Edge Glow */}
      <AIEdgeGlow status={status} isActive={true} audioLevel={audioLevel} />
      
      {/* Panel */}
      {/* © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™ */}
      <div 
        className="fixed z-[12050] flex flex-col inset-0"
        style={{
          height: '100dvh',
          paddingTop: 'env(safe-area-inset-top, 0px)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)'
        }}
      >
        <div 
          className="relative w-full h-full flex flex-col bg-black/95 backdrop-blur-xl overflow-hidden md:max-w-4xl md:max-h-[800px] md:rounded-3xl md:m-auto"
          style={{
            boxShadow: '0 0 20px rgba(0, 229, 255, 0.15), inset 0 0 40px rgba(0, 229, 255, 0.03)'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with VU Meter */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-[#F213A4] to-[#0EA5E9] bg-clip-text text-transparent">
                  NORAH AI
                </h2>
                <p className="text-sm text-white/60 mt-1">
                  {agentContext?.agentCode && agentContext.agentCode !== 'AG-UNKNOWN' 
                    ? `${t('norah_ready')} • Agente ${agentContext.agentCode}`
                    : t('norah_ready')
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
                {ttsEnabled ? t('tts_on') : t('tts_off')}
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
          <div 
            className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6"
            style={{
              minHeight: 0,
              WebkitOverflowScrolling: 'touch',
              overscrollBehavior: 'contain'
            }}
          >
            {messages.length === 0 ? (
              <div className="text-center text-white/40 py-12">
                {/* © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™ */}
                <p className="text-lg mb-2">{t('norah_ready')}</p>
                <p className="text-sm">{t('write_natural')}</p>
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
                          {message.metadata.cluesAnalyzed} {t('clues_analyzed')} • {message.metadata.mode}
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
                    <span className="text-sm">{status === 'thinking' ? t('processing') : t('speaking')}</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input with rotating placeholder + NBA Pills */}
          <div 
            className="p-4 md:p-6 border-t border-white/10"
            style={{
              paddingBottom: `calc(1rem + max(env(safe-area-inset-bottom, 0px), 4px))`
            }}
          >
            {/* v6.7: NBA Pills with toast feedback */}
            {/* © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™ – FIX v6.7 */}
            <NBAPills 
              suggestions={nbaPills} 
              onPick={async (payload) => {
                await logPillClick(payload);
                // Show toast feedback using sonner
                const { toast } = await import('sonner');
                toast.success('✔️ Azione impostata', { duration: 2000 });
                onSendMessage(payload, 'analyze');
              }} 
            />
            
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={nbaPills.length > 0 ? t('pills_ready') : t('norah_placeholder')}
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
            <p className="text-xs text-white/30 mt-2">{t('send_enter')}</p>
          </div>
        </div>
      </div>
      
      {/* © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™ */}
      {/* v6.6: Celebrations component */}
      {celebration && (
        <Celebrations
          celebration={celebration}
          onComplete={() => setCelebration(null)}
        />
      )}
    </>
  );

  return ReactDOM.createPortal(panelContent, document.body);
};

export default AIAnalystPanel;