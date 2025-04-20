import { useState, useEffect } from "react";
import { Bell, ChevronRight, Map, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import BottomNavigation from "@/components/layout/BottomNavigation";
import ClueCard from "@/components/clues/ClueCard";
import { currentEvent } from "./Events";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";

const mysteryPrizes = [
  {
    imageUrl: "/lovable-uploads/5a019ed0-63c1-47f8-a931-de097784d768.png",
    description: "Regolamento chiaro e trasparente per garantire un'esperienza equa per tutti i partecipanti."
  },
  {
    imageUrl: "/lovable-uploads/95a194d0-ba1a-4b76-85e4-6cc95fda46ab.png",
    description: "Un mese di indizi per svelare il mistero dell'auto in palio."
  },
  {
    imageUrl: "/lovable-uploads/cab356af-f03b-4b55-b5b3-ffc66c25841c.png",
    description: "Project X: L'esclusiva competizione per auto di lusso che trasforma i sogni in realtà."
  },
  {
    imageUrl: "/lovable-uploads/b83c1e65-cd66-46ad-937b-60d7fd0c6a63.png",
    description: "Unisciti a Project X: Il tuo sogno è a portata di mano con accesso anticipato agli indizi."
  },
  {
    imageUrl: "/lovable-uploads/a6250e9c-4a94-4357-b39c-e91ce9426e9e.png",
    description: "Vantaggi esclusivi per i membri premium con contenuti speciali e opportunità uniche."
  },
  {
    imageUrl: "/lovable-uploads/6ec76f7f-0e83-4005-8fb0-582ba83a7d60.png",
    description: "Il nostro target: appassionati di auto di lusso alla ricerca di emozioni uniche."
  },
  {
    imageUrl: "/lovable-uploads/a96033d6-a86e-4a83-a76a-ec3a24c56adf.png",
    description: "La nostra promessa: trasparenza e divertimento garantiti in ogni fase del gioco."
  },
  {
    imageUrl: "/lovable-uploads/ddb0368c-4853-49a4-b8e2-70abf7594e0d.png",
    description: "Registrazione gratuita vs. accesso premium: scegli il tuo livello di partecipazione."
  }
];

const Home = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [remainingTime, setRemainingTime] = useState({
    days: 14,
    hours: 23,
    minutes: 45,
    seconds: 18
  });
  
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

  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingTime(prev => {
        let { days, hours, minutes, seconds } = prev;
        
        seconds--;
        if (seconds < 0) {
          seconds = 59;
          minutes--;
          
          if (minutes < 0) {
            minutes = 59;
            hours--;
            
            if (hours < 0) {
              hours = 23;
              days--;
              
              if (days < 0) {
                clearInterval(timer);
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
              }
            }
          }
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const requestNotifications = () => {
    setNotificationsEnabled(true);
  };

  return (
    <div className="pb-20 min-h-screen bg-black">
      <header className="px-4 py-6 flex justify-between items-center border-b border-projectx-deep-blue">
        <h1 className="text-2xl font-bold neon-text">M1ssion</h1>
        
        <button 
          className={`p-2 rounded-full ${notificationsEnabled ? "bg-projectx-pink" : "bg-projectx-deep-blue"}`}
          onClick={requestNotifications}
        >
          <Bell className="w-5 h-5" />
        </button>
      </header>

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
          
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-projectx-deep-blue p-2 rounded">
              <div className="text-xs text-muted-foreground">Giorni</div>
              <div className="text-lg font-bold">{remainingTime.days}</div>
            </div>
            
            <div className="bg-projectx-deep-blue p-2 rounded">
              <div className="text-xs text-muted-foreground">Ore</div>
              <div className="text-lg font-bold">{remainingTime.hours}</div>
            </div>
            
            <div className="bg-projectx-deep-blue p-2 rounded">
              <div className="text-xs text-muted-foreground">Minuti</div>
              <div className="text-lg font-bold">{remainingTime.minutes}</div>
            </div>
            
            <div className="bg-projectx-deep-blue p-2 rounded">
              <div className="text-xs text-muted-foreground">Secondi</div>
              <div className="text-lg font-bold">{remainingTime.seconds}</div>
            </div>
          </div>
        </div>
      </section>

      <section className="p-4">
        <h2 className="text-xl font-bold mb-4">Premi Misteriosi dei Prossimi Eventi</h2>
        <div className="relative">
          <Carousel>
            <CarouselContent>
              {mysteryPrizes.map((prize, index) => (
                <CarouselItem key={index}>
                  <Card className="p-1">
                    <div 
                      className="h-48 bg-cover bg-center rounded-md" 
                      style={{ backgroundImage: `url(${prize.imageUrl})` }}
                    />
                    <p className="p-4 text-sm text-muted-foreground">
                      {prize.description}
                    </p>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2" />
            <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2" />
          </Carousel>
        </div>
      </section>

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

      <BottomNavigation />
    </div>
  );
};

export default Home;
