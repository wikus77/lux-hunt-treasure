
import { useState } from 'react';
import { useBuzzClues } from "@/hooks/useBuzzClues";

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
