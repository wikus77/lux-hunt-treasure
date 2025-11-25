// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { sanitizeHTML } from '@/lib/sanitize/htmlSanitizer';
import { getSupabaseUrl, getSupabaseAnonKey } from '@/lib/supabase/clientUtils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const NorahChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 Ciao! Sono NORAH, la tua assistente M1SSION™. Come posso aiutarti oggi?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    let assistantContent = '';

    const updateAssistant = (chunk: string) => {
      assistantContent += chunk;
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'assistant') {
          return prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantContent } : m
          );
        }
        return [...prev, { role: 'assistant', content: assistantContent, timestamp: new Date() }];
      });
    };

    try {
      await streamChat({
        messages: [...messages, userMessage],
        onDelta: updateAssistant,
        onDone: () => setIsLoading(false),
      });
    } catch (error: any) {
      console.error('❌ Chat error:', error);
      setIsLoading(false);
      
      if (error.message.includes('429')) {
        toast.error('⏳ Rate limit raggiunto. Riprova tra poco.');
      } else if (error.message.includes('402')) {
        toast.error('💳 Crediti esauriti. Contatta l\'amministratore.');
      } else {
        toast.error('❌ Errore comunicazione con Norah. Riprova.');
      }
      
      // Remove failed assistant message
      setMessages(prev => prev.filter(m => m.role !== 'assistant' || m.content));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0A0B14] border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#4361ee]/20 to-[#7209b7]/20 border-b border-white/10">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#4361ee] to-[#7209b7] flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-white">NORAH AI</h3>
          <p className="text-xs text-white/60">Assistente M1SSION™</p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
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
          {isLoading && (
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
      </ScrollArea>

      {/* Input */}
      <div className="p-4 bg-white/5 border-t border-white/10">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Chiedi qualcosa a Norah..."
            disabled={isLoading}
            className="flex-1 bg-white/10 border-white/20 text-white placeholder:text-white/40"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
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
  );
};

// Stream chat helper
async function streamChat({
  messages,
  onDelta,
  onDone,
}: {
  messages: Message[];
  onDelta: (chunk: string) => void;
  onDone: () => void;
}) {
  const CHAT_URL = `${getSupabaseUrl()}/functions/v1/norah-chat`;

  const resp = await fetch(CHAT_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${getSupabaseAnonKey()}`,
    },
    body: JSON.stringify({ messages }),
  });

  if (!resp.ok) {
    if (resp.status === 429) throw new Error('Rate limit exceeded (429)');
    if (resp.status === 402) throw new Error('Payment required (402)');
    throw new Error(`HTTP ${resp.status}`);
  }

  if (!resp.body) throw new Error('No response body');

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let textBuffer = '';
  let streamDone = false;

  while (!streamDone) {
    const { done, value } = await reader.read();
    if (done) break;
    textBuffer += decoder.decode(value, { stream: true });

    let newlineIndex: number;
    while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
      let line = textBuffer.slice(0, newlineIndex);
      textBuffer = textBuffer.slice(newlineIndex + 1);

      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (line.startsWith(':') || line.trim() === '') continue;
      if (!line.startsWith('data: ')) continue;

      const jsonStr = line.slice(6).trim();
      if (jsonStr === '[DONE]') {
        streamDone = true;
        break;
      }

      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {
        textBuffer = line + '\n' + textBuffer;
        break;
      }
    }
  }

  // Final flush
  if (textBuffer.trim()) {
    for (let raw of textBuffer.split('\n')) {
      if (!raw || raw.startsWith(':') || !raw.startsWith('data: ')) continue;
      const jsonStr = raw.slice(6).trim();
      if (jsonStr === '[DONE]') continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const content = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (content) onDelta(content);
      } catch {}
    }
  }

  onDone();
}
