
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
        className="fixed bottom-24 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
      >
        {/* Outer gradient ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#6A00FF] to-[#00E0FF] p-[2px] ai-button-glow">
          {/* Inner black circle for hollow effect */}
          <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
            {/* Central ring with gradient border */}
            <div className="w-[70%] h-[70%] rounded-full flex items-center justify-center 
                          border-[1.5px] border-transparent bg-clip-border"
                 style={{
                   backgroundImage: 'linear-gradient(black, black), linear-gradient(to bottom right, #6A00FF, #00E0FF)',
                   backgroundOrigin: 'border-box',
                   backgroundClip: 'content-box, border-box'
                 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21C16.4183 21 20 17.4183 20 13C20 8.58172 16.4183 5 12 5C7.58172 5 4 8.58172 4 13C4 17.4183 7.58172 21 12 21Z" 
                      stroke="url(#ai-gradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 15V13M12 11H12.01" 
                      stroke="url(#ai-gradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="ai-gradient" x1="4" y1="5" x2="20" y2="21" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6A00FF" />
                    <stop offset="1" stopColor="#00E0FF" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
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
