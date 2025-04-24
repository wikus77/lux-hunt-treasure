
import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, User, X, Send, ChevronDown } from "lucide-react";
import { ExpandingMenu } from "@/components/ui/expanding-menu";
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

  // Generate personalized answers based on user progress
  const generateResponse = (userMessage: string) => {
    setIsTyping(true);
    
    // In a real implementation, this would use a proper AI service
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
    <div className={`fixed bottom-16 right-4 z-40 transition-all duration-300 ${isOpen ? '' : 'translate-y-[calc(100%-3.5rem)]'}`}>
      <div 
        className="flex items-center justify-between bg-black/70 backdrop-blur-sm p-2 border border-projectx-deep-blue/40 rounded-t-lg cursor-pointer"
        onClick={() => setIsOpen(prev => !prev)}
      >
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-projectx-blue p-1">
            <Bot className="h-4 w-4" />
          </div>
          <span className="font-medium">Assistente AI</span>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      <Card className="w-[350px] max-h-[500px] border border-projectx-deep-blue/40 rounded-t-none shadow-lg">
        <CardContent className="p-0 flex flex-col h-[450px]">
          <div className="flex-grow overflow-y-auto p-3 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-projectx-blue text-white'
                      : 'bg-black/40 border border-projectx-deep-blue/40'
                  }`}
                >
                  <div className="text-sm">{msg.content}</div>
                  <div className="text-right text-xs text-gray-400 mt-1">
                    {formatTimestamp(msg.timestamp)}
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%] px-4 py-2 rounded-lg bg-black/40 border border-projectx-deep-blue/40">
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
          
          <div className="p-3 pt-2 border-t border-gray-800">
            <div className="flex flex-wrap gap-2 mb-2">
              {suggestions.map((suggestion) => (
                <Suggestion
                  key={suggestion}
                  text={suggestion}
                  onClick={() => handleSuggestionClick(suggestion)}
                />
              ))}
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Scrivi un messaggio..."
                className="flex-grow bg-black/40 border border-projectx-deep-blue/40 rounded-md px-3 py-2 text-sm"
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={!input.trim() || isTyping}
                className="bg-projectx-blue hover:bg-projectx-blue/80"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
