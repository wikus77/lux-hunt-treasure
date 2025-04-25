import { useState } from 'react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChatMessages } from './ChatMessages';
import { ChatSuggestions } from './ChatSuggestions';
import { ChatHeader } from './ChatHeader';
import { ChatInput } from './ChatInput';
import { useChat } from '@/hooks/useChat';
import { motion } from "framer-motion";

export function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const { messages, isTyping, addMessage } = useChat();
  
  return (
    <>
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 z-50 w-11 h-11 rounded-full flex items-center justify-center 
                   shadow-lg hover:scale-105 transition-transform duration-300
                   bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 p-[2px]
                   ai-button-glow float-animation"
        whileHover={{ 
          boxShadow: "0 0 15px rgba(250, 204, 21, 0.7)",
          scale: 1.05
        }}
      >
        {/* Inner black circle for "hollow" effect */}
        <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
          <div className="w-[70%] h-[70%] rounded-full border-2 border-yellow-400/80 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" 
                    stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M10 12.5V10M10 7.5H10.01" 
                    stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </motion.button>

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
