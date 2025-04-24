import { useState, useRef, useEffect } from 'react';
import { Circle } from 'lucide-react';
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Bot, User, Send } from "lucide-react";
import { useBuzzClues } from "@/hooks/useBuzzClues";

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SuggestionProps {
  text: string;
  onClick: () => void;
}

const Suggestion = ({ text, onClick }: SuggestionProps) => (
  <Button
    variant="outline"
    size="sm"
    onClick={onClick}
    className="text-sm bg-black/40 border-projectx-deep-blue/40 hover:bg-black/60 press-effect"
  >
    {text}
  </Button>
);

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Ciao! Sono il tuo assistente personale. Come posso aiutarti nella tua caccia al tesoro?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { unlockedClues } = useBuzzClues();
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const suggestions = [
    'Dove dovrei cercare?',
    'Qual è l\'indizio più importante?',
    'Consigli per il prossimo passo?',
    'Riassumi la situazione',
  ];

  const generateResponse = (userMessage: string) => {
    setIsTyping(true);
    
    setTimeout(() => {
      let response = '';
      const lowerMessage = userMessage.toLowerCase();
      
      if (lowerMessage.includes('cercare') || lowerMessage.includes('dove')) {
        if (unlockedClues < 10) {
          response = "Consiglio di iniziare dalle aree urbane più frequentate. Gli indizi iniziali si trovano spesso in luoghi iconici e facilmente accessibili. Cerca di sbloccare più indizi prima di avventurarti in aree più complesse.";
        } else if (unlockedClues < 30) {
          response = "Hai già un buon numero di indizi! Prova a esplorare le aree periferiche ora. Dalle tue statistiche vedo che hai già coperto le principali zone del centro. Controlla gli indizi che collegano location storiche.";
        } else {
          response = "Con il tuo livello di esperienza, dovresti concentrarti sulle aree evidenziate in rosso sulla mappa. C'è un pattern emergente nelle coordinate che hai già scoperto. Prova a triangolare la posizione usando gli ultimi 3 indizi.";
        }
      }
      else if (lowerMessage.includes('indizio') || lowerMessage.includes('importante')) {
        if (unlockedClues < 15) {
          response = "Al momento, concentrati sull'indizio riguardante 'la piazza con la fontana antica'. È il punto di partenza per capire il pattern generale. Gli indizi successivi si baseranno su questa posizione.";
        } else {
          response = "Gli indizi numerati 7, 12 e 24 sembrano formare un triangolo quando posizionati sulla mappa. Questo pattern è cruciale per identificare il punto di intersezione dove potrebbe trovarsi il prossimo oggetto.";
        }
      }
      else if (lowerMessage.includes('consig') || lowerMessage.includes('prossimo passo')) {
        response = `Ti consiglio di ${unlockedClues < 20 ? 'sbloccare almeno altri 5 indizi prima di' : ''} riconsiderare le aree che hai già visitato ma con una prospettiva diversa. Alcuni indizi richiedono di osservare i luoghi in momenti diversi della giornata. Hai notato che alcuni riferimenti negli indizi 3 e 9 parlano di "ombre" e "riflessi"?`;
      }
      else if (lowerMessage.includes('riassumi') || lowerMessage.includes('situazione')) {
        response = `Hai sbloccato ${unlockedClues} indizi su un totale stimato di 85. Sei nel ${Math.round((unlockedClues / 85) * 100)}% dei partecipanti più esperti. Le aree che hai esplorato maggiormente sono il centro storico e la zona universitaria. Ti mancano indizi principalmente nelle aree periferiche nord e sud-est. Il tuo approccio sembra essere metodico, ma potresti migliorare connettendo meglio gli indizi tra loro.`;
      }
      else {
        response = "Interessante domanda. In base ai tuoi progressi attuali, ti suggerisco di prestare attenzione ai pattern ricorrenti negli indizi che hai già trovato. Spesso la chiave non è trovare nuovi indizi, ma capire meglio quelli che già hai.";
      }
      
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: response,
          timestamp: new Date(),
        },
      ]);
      
      setIsTyping(false);
    }, 1500);
  };
  
  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    
    generateResponse(input);
  };
  
  const handleSuggestionClick = (suggestion: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: suggestion,
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, newMessage]);
    generateResponse(suggestion);
  };
  
  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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

            {/* Messages */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-yellow-300 to-green-400 text-black'
                        : 'bg-white/10'
                    }`}
                  >
                    <div className="text-sm">{msg.content}</div>
                    <div className="text-right text-xs opacity-70 mt-1">
                      {formatTimestamp(msg.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] px-4 py-2 rounded-2xl bg-white/10">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestions */}
            <div className="p-4 border-t border-white/10">
              <div className="flex flex-wrap gap-2 mb-4">
                {suggestions.map((suggestion) => (
                  <Suggestion
                    key={suggestion}
                    text={suggestion}
                    onClick={() => handleSuggestionClick(suggestion)}
                  />
                ))}
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
