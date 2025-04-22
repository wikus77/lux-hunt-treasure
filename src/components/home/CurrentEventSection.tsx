
import { Button } from "@/components/ui/button";
import { Calendar, ChevronRight } from "lucide-react";
import { currentEvent } from "@/data/eventData";
import CountdownTimer from "./CountdownTimer";
import { useNavigate } from "react-router-dom";

export const CurrentEventSection = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full px-0 py-4">
      <div className="flex justify-between items-center mb-4 px-4 w-full">
        <h2 className="text-xl font-bold">Evento Corrente</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-m1ssion-neon-blue"
          onClick={() => navigate('/events')}
        >
          Dettagli <ChevronRight className="ml-1 w-4 h-4" />
        </Button>
      </div>
      <div className="glass-card mb-6 w-full px-0">
        <h3 className="text-lg font-bold mb-2 px-4">{currentEvent.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 px-4">
          {currentEvent.description}
        </p>
        <div className="flex space-x-2 mb-4 px-4">
          <div className="flex items-center text-xs bg-m1ssion-deep-blue px-3 py-1 rounded-full">
            <Calendar className="w-3 h-3 mr-1" />
            <span>Termina il {currentEvent.date}</span>
          </div>
        </div>
        <div 
          className="h-40 bg-cover bg-center rounded-md mb-4 w-full cursor-pointer"
          style={{ backgroundImage: `url(${currentEvent.imageUrl})` }} 
          onClick={() => navigate('/events')}
        />
        <CountdownTimer />
      </div>
    </section>
  );
};

export default CurrentEventSection;
