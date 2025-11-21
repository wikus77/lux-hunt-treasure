
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isTyping: boolean;
}

export const ChatInput = ({ onSendMessage, isTyping }: ChatInputProps) => {
  const [input, setInput] = useState('');

  const handleSendMessage = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput('');
  };

  return (
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
  );
};
