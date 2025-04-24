
import { useState } from 'react';
import { Circle } from 'lucide-react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChatMessages } from './ChatMessages';
import { ChatSuggestions } from './ChatSuggestions';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { useChat } from '@/hooks/useChat';

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, isTyping, addMessage } = useChat();
  
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-50 w-12 h-12 rounded-full bg-gradient-to-r from-yellow-300 to-green-400 flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 animate-spin-slow border-2 border-white/30 bg-opacity-30 backdrop-blur-sm"
      >
        <Circle className="w-6 h-6 text-white/70" />
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[400px] p-0 bg-black/90 border border-white/10">
          <div className="flex flex-col h-[600px]">
            <ChatHeader />
            <ChatMessages messages={messages} isTyping={isTyping} />
            
            <div className="p-4 border-t border-white/10">
              <div className="mb-4">
                <ChatSuggestions onSuggestionClick={addMessage} />
              </div>
              <ChatInput onSendMessage={addMessage} isTyping={isTyping} />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
