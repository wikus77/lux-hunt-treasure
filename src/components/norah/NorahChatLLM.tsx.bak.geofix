// © 2025 Joseph MULÉ – M1SSION™ – NORAH AI Chat Component (LLM-powered)
import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Send, Bot, User, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useNorahLLM } from '@/intel/norah/useNorahLLM';
import { sanitizeHTML } from '@/lib/sanitize/htmlSanitizer';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const NorahChatLLM: React.FC<{ userId: string }> = ({ userId }) => {
  const { askNorah, isProcessing, isOffline, clearHistory } = useNorahLLM({ 
    userId,
    route: '/intelligence',
    locale: 'it' 
  });

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 Ciao! Sono NORAH, la tua assistente M1SSION™. Come posso aiutarti oggi?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Get response from LLM
    const response = await askNorah(input.trim());

    if (response) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const modalContent = (
    <>
      {/* Full-screen overlay backdrop */}
      <div className="norah-chat-modal-backdrop" />
      
      {/* Modal container */}
      <div className="norah-chat-modal">
        {/* Header */}
        <div className="norah-chat-modal__header">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#4361ee] to-[#7209b7] flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-white">NORAH AI</h3>
            <p className="text-xs text-white/60">Assistente M1SSION™</p>
          </div>
          {isOffline && (
            <Badge variant="destructive" className="gap-1">
              <WifiOff className="w-3 h-3" />
              Offline
            </Badge>
          )}
        </div>

        {/* Messages */}
        <div className="norah-chat-modal__body" ref={scrollRef}>
          <div className="space-y-3 md:space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === 'assistant' ? 'justify-start' : 'justify-end'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#4361ee] to-[#7209b7] flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-xl ${
                    message.role === 'assistant'
                      ? 'bg-white/5 text-white'
                      : 'bg-gradient-to-r from-[#4361ee] to-[#7209b7] text-white'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <div 
                      className="text-sm prose prose-invert prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: sanitizeHTML(message.content) }}
                    />
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  )}
                  <span className="text-xs opacity-50 mt-1 block">
                    {message.timestamp.toLocaleTimeString('it-IT', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-white" />
                  </div>
                )}
              </div>
            ))}
            {isProcessing && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#4361ee] to-[#7209b7] flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white animate-pulse" />
                </div>
                <div className="bg-white/5 p-3 rounded-xl">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-white/50 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Input */}
        <div className="norah-chat-modal__footer">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Chiedi qualcosa a Norah..."
              disabled={isProcessing}
              className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isProcessing}
              size="icon"
              className="bg-gradient-to-r from-[#4361ee] to-[#7209b7] hover:opacity-90"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-white/40 mt-2">
            💡 Chiedi informazioni su BUZZ, piani, Final Shot e molto altro!
          </p>
        </div>
      </div>
    </>
  );

  // Render modal in portal (full-screen overlay)
  return ReactDOM.createPortal(
    modalContent,
    document.body
  );
};
