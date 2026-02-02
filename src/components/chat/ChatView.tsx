/**
 * Chat View - WhatsApp-style STATIC conversation view
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Send, 
  MapPin, 
  Loader2, 
  User,
  Lock,
  Check,
  CheckCheck
} from 'lucide-react';
import { useChatMessages, ChatMessage } from '@/hooks/useChat';
import { Button } from '@/components/ui/button';
import { useGeolocation } from '@/hooks/useGeolocation';
import { supabase } from '@/integrations/supabase/client';
import { format, isToday, isYesterday } from 'date-fns';
import { it } from 'date-fns/locale';
import { useKeyboardInset } from '@/hooks/useKeyboardInset'; // 🔧 FIX v12

interface ChatViewProps {
  conversationId: string;
  recipientName: string;
  recipientAvatar?: string | null;
  onBack: () => void;
}

export function ChatView({ 
  conversationId, 
  recipientName, 
  recipientAvatar,
  onBack 
}: ChatViewProps) {
  const { messages, isLoading, isSending, sendMessage, sendLocation } = useChatMessages(conversationId);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { position } = useGeolocation();

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // 🔧 FIX v11: Use unified keyboard inset hook
  const { isOpen: isKeyboardOpen, inset: keyboardInset } = useKeyboardInset();

  // ✅ Mark messages as read when viewing conversation
  useEffect(() => {
    if (conversationId && messages.length > 0) {
      supabase.rpc('mark_messages_read', { p_conversation_id: conversationId })
        .then(({ error }) => {
          if (error) console.warn('[ChatView] Error marking read:', error);
        });
    }
  }, [conversationId, messages.length]);

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;
    
    const content = inputValue;
    setInputValue('');
    await sendMessage(content);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl+Enter o Cmd+Enter = invia messaggio
    // Enter semplice = nuova riga (comportamento default textarea)
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleShareLocation = async () => {
    if (!position) {
      alert('Posizione non disponibile');
      return;
    }
    await sendLocation(position.lat, position.lng);
  };

  // Format date header
  const formatDateHeader = (date: Date) => {
    if (isToday(date)) return 'Oggi';
    if (isYesterday(date)) return 'Ieri';
    return format(date, 'dd MMMM yyyy', { locale: it });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.created_at).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, ChatMessage[]>);

  // Calculate heights for proper layout
  // 🔧 FIX: Hero 15% bigger (60 * 1.15 = 69)
  const headerHeight = 69;
  const inputHeight = 56;
  const safeAreaTop = 'env(safe-area-inset-top, 47px)';
  const safeAreaBottom = 'env(safe-area-inset-bottom, 34px)';

  return (
    <div 
      className="fixed inset-0 bg-[#070818] overflow-hidden"
      style={{
        zIndex: 50000,
      }}
    >
      {/* Chat Header - FIXED ASSOLUTO (non si muove MAI) 
          🔧 FIX: Hero 15% bigger and higher up */}
      <div 
        style={{ 
          position: 'fixed',
          left: 0,
          right: 0,
          top: `calc(${safeAreaTop} + 8px)`,
          height: `${headerHeight}px`,
          zIndex: 60001,
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          padding: '0 16px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(15, 23, 42, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          style={{ padding: '8px', background: 'transparent' }}
        >
          <ArrowLeft style={{ width: '22px', height: '22px', color: '#FFFFFF' }} />
        </Button>
        
        {recipientAvatar ? (
          <img
            src={recipientAvatar}
            alt={recipientName}
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid rgba(0, 209, 255, 0.4)',
            }}
          />
        ) : (
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: 'rgba(0, 209, 255, 0.15)',
            border: '2px solid rgba(0, 209, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <User style={{ width: '24px', height: '24px', color: '#00D1FF' }} />
          </div>
        )}
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3 style={{ 
            fontWeight: 600, 
            color: '#FFFFFF', 
            fontSize: '18px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>{recipientName}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Lock style={{ width: '12px', height: '12px', color: '#22C55E' }} />
            <span style={{ fontSize: '12px', color: '#22C55E' }}>Crittografato</span>
          </div>
        </div>
      </div>

      {/* Messages Container - SCROLLABLE ONLY THIS PART 
          🔧 FIX: Adjust top for new hero, bottom for keyboard */}
      <div 
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          top: `calc(${safeAreaTop} + 8px + ${headerHeight}px + 8px)`,
          // 🔧 FIX: Input bar più in basso, si ancora alla tastiera
          bottom: isKeyboardOpen ? `${keyboardInset + inputHeight + 16}px` : `${inputHeight + 24}px`,
          paddingTop: '8px',
          paddingBottom: '16px',
          transition: 'bottom 0.15s ease-out',
        }}
      >
        <div className="px-4 space-y-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12">
              <Lock className="w-12 h-12 text-cyan-400/50 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">
                I messaggi sono crittografati end-to-end.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Invia il primo messaggio!
              </p>
            </div>
          ) : (
            <>
              {Object.entries(groupedMessages).map(([date, msgs]) => (
                <div key={date}>
                  <div className="flex items-center justify-center my-3">
                    <span className="px-3 py-1 bg-gray-800/70 rounded-full text-xs text-gray-400">
                      {formatDateHeader(new Date(date))}
                    </span>
                  </div>
                  
                  {msgs.map((message, index) => (
                    <MessageBubble 
                      key={message.message_id} 
                      message={message}
                      showAvatar={
                        index === 0 || 
                        msgs[index - 1]?.sender_id !== message.sender_id
                      }
                    />
                  ))}
                </div>
              ))}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Bar - GLASS STYLE 
          🔧 FIX: Input bar più in basso, si ancora alla tastiera, testo leggibile */}
      <div 
        style={{ 
          position: 'fixed',
          left: '8px',
          right: '8px',
          // 🔧 FIX: Più in basso quando tastiera chiusa, ancorata alla tastiera quando aperta
          bottom: isKeyboardOpen ? `${keyboardInset + 8}px` : '16px',
          minHeight: `${inputHeight}px`,
          zIndex: 60000,
          transition: 'bottom 0.15s ease-out',
          background: 'rgba(15, 23, 42, 0.98)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 212, 255, 0.35)',
          borderRadius: '16px',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.5), 0 0 20px rgba(0, 212, 255, 0.15)',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShareLocation}
            disabled={!position || isSending}
            style={{ 
              padding: '8px', 
              background: 'transparent', 
              borderRadius: '50%',
              flexShrink: 0,
            }}
            title="Condividi posizione"
          >
            <MapPin style={{ width: '20px', height: '20px', color: '#00D1FF' }} />
          </Button>
          
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
            }}
            onKeyDown={handleKeyPress}
            placeholder="Scrivi un messaggio..."
            disabled={isSending}
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
              background: 'rgba(30, 41, 59, 0.8)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              borderRadius: '12px',
              padding: '10px 16px',
              // 🔧 FIX: Testo digitato LEGGIBILE - bianco brillante
              color: '#FFFFFF',
              fontSize: '15px',
              fontWeight: 400,
              lineHeight: 1.4,
              maxHeight: '120px',
              minHeight: '40px',
              resize: 'none',
              overflowY: 'auto',
              outline: 'none',
              transition: 'border-color 0.2s',
              WebkitAppearance: 'none',
            }}
          />
          
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            size="sm"
            style={{
              padding: '10px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00D1FF 0%, #3B82F6 100%)',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(0, 209, 255, 0.3)',
              opacity: !inputValue.trim() || isSending ? 0.5 : 1,
            }}
          >
            {isSending ? (
              <Loader2 style={{ width: '20px', height: '20px', animation: 'spin 1s linear infinite' }} />
            ) : (
              <Send style={{ width: '20px', height: '20px', color: '#FFFFFF' }} />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: ChatMessage;
  showAvatar: boolean;
}

function MessageBubble({ message, showAvatar }: MessageBubbleProps) {
  const isOwn = message.is_own;
  const isLocation = message.message_type === 'location';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '8px',
        marginBottom: '4px',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
      }}
    >
      {!isOwn && (
        <div style={{ width: '28px', height: '28px', flexShrink: 0 }}>
          {showAvatar && (
            message.sender_avatar ? (
              <img
                src={message.sender_avatar}
                alt={message.sender_username}
                style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
              />
            ) : (
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                background: 'rgba(168, 85, 247, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#A855F7' }}>
                  {message.sender_username?.charAt(0).toUpperCase()}
                </span>
              </div>
            )
          )}
        </div>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '75%' }}>
        {/* Nome mittente per messaggi non propri */}
        {!isOwn && showAvatar && message.sender_username && (
          <span style={{ 
            fontSize: '11px', 
            color: '#A855F7', 
            fontWeight: 500, 
            marginBottom: '2px', 
            marginLeft: '4px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {message.sender_username}
          </span>
        )}
        
        <div
          style={{
            padding: '10px 14px',
            borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            // 🔧 FIX: Testi più leggibili
            background: isOwn 
              ? 'linear-gradient(135deg, #0891B2 0%, #2563EB 100%)' 
              : 'rgba(55, 65, 81, 0.95)',
            border: isOwn ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {isLocation && message.metadata?.lat && message.metadata?.lng ? (
            <a
              href={`https://www.google.com/maps?q=${message.metadata.lat},${message.metadata.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: '#FFFFFF',
                textDecoration: 'none',
              }}
            >
              <MapPin style={{ width: '16px', height: '16px' }} />
              <span>📍 Apri posizione</span>
            </a>
          ) : (
            <p style={{
              // 🔧 FIX: Testo BIANCO BRILLANTE per leggibilità
              color: '#FFFFFF',
              fontSize: '15px',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              margin: 0,
            }}>
              {message.content}
            </p>
          )}
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '4px',
            marginTop: '4px',
            color: isOwn ? 'rgba(255, 255, 255, 0.7)' : 'rgba(156, 163, 175, 0.8)',
          }}>
            <span style={{ fontSize: '10px' }}>
              {format(new Date(message.created_at), 'HH:mm')}
            </span>
            {/* Spunte lettura solo per messaggi propri */}
            {isOwn && (
              message.read_by && message.read_by.length > 0 ? (
                <CheckCheck style={{ width: '14px', height: '14px', color: '#00D1FF' }} /> 
              ) : (
                <Check style={{ width: '14px', height: '14px' }} />
              )
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default ChatView;
