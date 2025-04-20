
import { Button } from "@/components/ui/button";
import { Calendar, ChevronRight } from "lucide-react";
import { currentEvent } from "@/pages/Events";
import CountdownTimer from "./CountdownTimer";

export const CurrentEventSection = () => {
  return (
    <section className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Evento Corrente</h2>
        <Button variant="ghost" size="sm" className="text-m1ssion-neon-blue">
          Dettagli <ChevronRight className="ml-1 w-4 h-4" />
        </Button>
      </div>
      
      <div className="glass-card mb-6">
        <h3 className="text-lg font-bold mb-2">{currentEvent.title}</h3>
        <p className="text-sm text-muted-foreground mb-4">
          {currentEvent.description}
        </p>
        
        <div className="flex space-x-2 mb-4">
          <div className="flex items-center text-xs bg-m1ssion-deep-blue px-3 py-1 rounded-full">
            <Calendar className="w-3 h-3 mr-1" />
            <span>Termina il {currentEvent.date}</span>
          </div>
        </div>
        
        <div 
          className="h-40 bg-cover bg-center rounded-md mb-4" 
          style={{ backgroundImage: `url(${currentEvent.imageUrl})` }} 
        />
        
        <CountdownTimer />
      </div>
    </section>
  );
};

export default CurrentEventSection;
