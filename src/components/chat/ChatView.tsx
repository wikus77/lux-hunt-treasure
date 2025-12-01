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
  Lock
} from 'lucide-react';
import { useChatMessages, ChatMessage } from '@/hooks/useChat';
import { Button } from '@/components/ui/button';
import { useGeolocation } from '@/hooks/useGeolocation';
import { format, isToday, isYesterday } from 'date-fns';
import { it } from 'date-fns/locale';

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
  const inputRef = useRef<HTMLInputElement>(null);
  const { position } = useGeolocation();

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleSend = async () => {
    if (!inputValue.trim() || isSending) return;
    
    const content = inputValue;
    setInputValue('');
    await sendMessage(content);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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
  const headerHeight = 60;
  const inputHeight = 56;
  const bottomNavHeight = 80;
  const safeAreaTop = 'env(safe-area-inset-top, 47px)';
  const safeAreaBottom = 'env(safe-area-inset-bottom, 34px)';

  return (
    <div 
      className="fixed inset-0 bg-[#070818] flex flex-col"
      style={{
        paddingTop: `calc(72px + ${safeAreaTop})`, // UnifiedHeader height
        zIndex: 100,
      }}
    >
      {/* Chat Header - FIXED */}
      <div 
        className="flex items-center gap-3 px-4 py-3 border-b border-white/10 bg-gray-900/95 backdrop-blur-sm shrink-0"
        style={{ height: `${headerHeight}px` }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="p-2 hover:bg-white/10"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </Button>
        
        {recipientAvatar ? (
          <img
            src={recipientAvatar}
            alt={recipientName}
            className="w-10 h-10 rounded-full object-cover border-2 border-cyan-500/30"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-cyan-500/20 border-2 border-cyan-500/30 flex items-center justify-center">
            <User className="w-5 h-5 text-cyan-400" />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{recipientName}</h3>
          <div className="flex items-center gap-1 text-xs text-green-400">
            <Lock className="w-3 h-3" />
            <span>Crittografato</span>
          </div>
        </div>
      </div>

      {/* Messages Container - SCROLLABLE ONLY THIS PART */}
      <div 
        className="flex-1 overflow-y-auto overscroll-contain"
        style={{
          paddingBottom: '8px',
          paddingTop: '8px',
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

      {/* Input Bar - FIXED at bottom, above bottom nav */}
      <div 
        className="border-t border-white/10 bg-gray-900/95 backdrop-blur-sm shrink-0"
        style={{ 
          height: `${inputHeight}px`,
          marginBottom: `calc(${bottomNavHeight}px + ${safeAreaBottom})`,
        }}
      >
        <div className="flex items-center gap-2 px-3 h-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShareLocation}
            disabled={!position || isSending}
            className="p-2 hover:bg-white/10 flex-shrink-0"
            title="Condividi posizione"
          >
            <MapPin className="w-5 h-5 text-cyan-400" />
          </Button>
          
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Scrivi un messaggio..."
            disabled={isSending}
            className="flex-1 bg-gray-800/60 border border-white/10 rounded-full px-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors disabled:opacity-50"
          />
          
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isSending}
            size="sm"
            className="p-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 flex-shrink-0"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
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
      className={`flex items-end gap-2 mb-1 ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      {!isOwn && (
        <div className="w-7 h-7 flex-shrink-0">
          {showAvatar && (
            message.sender_avatar ? (
              <img
                src={message.sender_avatar}
                alt={message.sender_username}
                className="w-7 h-7 rounded-full object-cover"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-purple-500/20 flex items-center justify-center">
                <span className="text-xs font-bold text-purple-400">
                  {message.sender_username?.charAt(0).toUpperCase()}
                </span>
              </div>
            )
          )}
        </div>
      )}
      
      <div
        className={`max-w-[75%] px-3 py-2 rounded-2xl ${
          isOwn
            ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-sm'
            : 'bg-gray-800/90 text-white border border-white/5 rounded-bl-sm'
        }`}
      >
        {isLocation && message.metadata?.lat && message.metadata?.lng ? (
          <a
            href={`https://www.google.com/maps?q=${message.metadata.lat},${message.metadata.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm hover:underline"
          >
            <MapPin className="w-4 h-4" />
            <span>📍 Apri posizione</span>
          </a>
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        )}
        
        <p className={`text-[10px] mt-0.5 text-right ${isOwn ? 'text-white/60' : 'text-gray-500'}`}>
          {format(new Date(message.created_at), 'HH:mm')}
        </p>
      </div>
    </motion.div>
  );
}

export default ChatView;
