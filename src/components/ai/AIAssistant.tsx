
import { useState } from 'react';
import { Circle } from 'lucide-react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bot, Send } from "lucide-react";
import { ChatMessages } from './ChatMessages';
import { ChatSuggestions } from './ChatSuggestions';
import { useChat } from '@/hooks/useChat';

export function AIAssistant() {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { messages, isTyping, addMessage } = useChat();
  
  const handleSendMessage = () => {
    if (!input.trim()) return;
    addMessage(input);
    setInput('');
  };
  
  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-50 w-12 h-12 rounded-full bg-gradient-to-r from-yellow-300 to-green-400 flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 animate-spin-slow border-2 border-white/30 bg-opacity-30 backdrop-blur-sm"
      >
        <Circle className="w-6 h-6 text-white/70" />
      </button>

      {/* Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[400px] p-0 bg-black/90 border border-white/10">
          <div className="flex flex-col h-[600px]">
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-white/10">
              <div className="rounded-full bg-gradient-to-r from-yellow-300 to-green-400 p-2">
                <Bot className="h-5 w-5 text-black" />
              </div>
              <span className="font-medium">Assistente AI</span>
            </div>

            <ChatMessages messages={messages} isTyping={isTyping} />

            {/* Quick Suggestions */}
            <div className="p-4 border-t border-white/10">
              <div className="mb-4">
                <ChatSuggestions onSuggestionClick={addMessage} />
              </div>

              {/* Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Scrivi un messaggio..."
                  className="flex-grow bg-white/10 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300/50"
                />
                <Button
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!input.trim() || isTyping}
                  className="rounded-full bg-gradient-to-r from-yellow-300 to-green-400 hover:opacity-90"
                >
                  <Send className="h-4 w-4 text-black" />
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
