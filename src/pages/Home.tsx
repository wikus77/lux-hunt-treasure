
import { useState, useEffect } from "react";
import { Bell, ChevronRight, Map, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/layout/BottomNavigation";
import ClueCard from "@/components/clues/ClueCard";

const Home = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  // Esempio di indizi per demo
  const clues = [
    {
      id: 1,
      title: "Primo Indizio",
      description: "L'auto si trova in una città che inizia con la lettera 'M'.",
      week: 1,
      isLocked: false,
      subscriptionType: "Base"
    },
    {
      id: 2,
      title: "Colore e Dettagli",
      description: "L'auto è di colore rosso con dettagli in fibra di carbonio.",
      week: 1,
      isLocked: true,
      subscriptionType: "Silver"
    },
    {
      id: 3,
      title: "Localizzazione",
      description: "L'auto è parcheggiata vicino a un famoso monumento.",
      week: 1,
      isLocked: true,
      subscriptionType: "Gold"
    },
    {
      id: 4,
      title: "Coordinate Precise",
      description: "Coordinate GPS precise della posizione dell'auto.",
      week: 1,
      isLocked: true,
      subscriptionType: "Black"
    },
  ];

  const requestNotifications = () => {
    // In un'app reale, qui andrebbe la richiesta di permesso per le notifiche
    setNotificationsEnabled(true);
  };

  return (
    <div className="pb-20 min-h-screen bg-black">
      {/* Header */}
      <header className="px-4 py-6 flex justify-between items-center border-b border-projectx-deep-blue">
        <h1 className="text-2xl font-bold neon-text">Project X</h1>
        
        <button 
          className={`p-2 rounded-full ${notificationsEnabled ? "bg-projectx-pink" : "bg-projectx-deep-blue"}`}
          onClick={requestNotifications}
        >
          <Bell className="w-5 h-5" />
        </button>
      </header>

      {/* Current Event */}
      <section className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Evento Corrente</h2>
          <Button variant="ghost" size="sm" className="text-projectx-neon-blue">
            Dettagli <ChevronRight className="ml-1 w-4 h-4" />
          </Button>
        </div>
        
        <div className="glass-card mb-6">
          <h3 className="text-lg font-bold mb-2">Ferrari 488 GTB</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Trova questa incredibile Ferrari 488 GTB nascosta a Milano per vincerla!
          </p>
          
          <div className="flex space-x-2 mb-4">
            <div className="flex items-center text-xs bg-projectx-deep-blue px-3 py-1 rounded-full">
              <Calendar className="w-3 h-3 mr-1" />
              <span>Termina il 15 Maggio</span>
            </div>
            
            <div className="flex items-center text-xs bg-projectx-deep-blue px-3 py-1 rounded-full">
              <Map className="w-3 h-3 mr-1" />
              <span>Milano, Italia</span>
            </div>
          </div>
          
          <div className="h-40 bg-cover bg-center rounded-md mb-4" style={{ backgroundImage: "url('/public/lovable-uploads/781937e4-2515-4cad-8393-c51c1c81d6c9.png')" }} />
          
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-projectx-deep-blue p-2 rounded">
              <div className="text-xs text-muted-foreground">Giorni</div>
              <div className="text-lg font-bold">14</div>
            </div>
            
            <div className="bg-projectx-deep-blue p-2 rounded">
              <div className="text-xs text-muted-foreground">Ore</div>
              <div className="text-lg font-bold">23</div>
            </div>
            
            <div className="bg-projectx-deep-blue p-2 rounded">
              <div className="text-xs text-muted-foreground">Minuti</div>
              <div className="text-lg font-bold">45</div>
            </div>
            
            <div className="bg-projectx-deep-blue p-2 rounded">
              <div className="text-xs text-muted-foreground">Secondi</div>
              <div className="text-lg font-bold">18</div>
            </div>
          </div>
        </div>
      </section>

      {/* Clues Section */}
      <section className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Indizi Disponibili</h2>
          <div className="text-xs px-2 py-1 rounded-full bg-projectx-deep-blue">
            Settimana 1/4
          </div>
        </div>
        
        {clues.map((clue) => (
          <ClueCard 
            key={clue.id} 
            title={clue.title} 
            description={clue.description} 
            week={clue.week} 
            isLocked={clue.isLocked} 
            subscriptionType={clue.subscriptionType as any}
          />
        ))}
        
        <div className="mt-6">
          <Button 
            className="w-full bg-gradient-to-r from-projectx-blue to-projectx-pink"
          >
            Sblocca Tutti gli Indizi
          </Button>
        </div>
      </section>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Home;
