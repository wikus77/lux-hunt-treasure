
import { useState } from 'react';
import { useBuzzClues } from "@/hooks/useBuzzClues";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Ciao! Sono il tuo assistente personale. Come posso aiutarti nella tua caccia al tesoro?',
      timestamp: new Date(),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const { unlockedClues } = useBuzzClues();

  const generateResponse = async (userMessage: string) => {
    setIsTyping(true);
    
    try {
      const chatMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Add user message to the chat history for context
      chatMessages.push({
        role: 'user',
        content: userMessage
      });

      console.log("Sending chat messages to AI assistant with unlocked clues:", unlockedClues);

      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: chatMessages,
          unlockedClues
        }
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(`Error invoking AI chat: ${error.message}`);
      }

      if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
        console.error("Unexpected response format:", data);
        throw new Error("Risposta AI non valida");
      }

      const response = data.choices[0].message.content;
      
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      console.error('Error generating response:', error);
      toast.error("Mi dispiace, c'è stato un errore nel generare la risposta. Riprova tra poco.");
    } finally {
      setIsTyping(false);
    }
  };

  const addUserMessage = (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    generateResponse(content);
  };

  return {
    messages,
    isTyping,
    addMessage: addUserMessage,
  };
};
