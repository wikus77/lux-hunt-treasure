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
    imageUrl: "/lovable-uploads/781937e4-2515-4cad-8393-c51c1c81d6c9.png",
    description: "Un oggetto dal valore inestimabile che incarna l'essenza del lusso italiano. Solo i più fortunati potranno possederlo."
  },
  {
    imageUrl: "/lovable-uploads/9daa7fae-5be8-482a-8136-7113724b28ad.png",
    description: "Un capolavoro che sfida l'immaginazione, dove tecnologia e arte si fondono in perfetta armonia."
  },
  {
    imageUrl: "/lovable-uploads/b79099f5-31ab-44a3-b271-9cde8b7932e1.png",
    description: "Un tesoro custodito nei più esclusivi vault del mondo, simbolo di potere e prestigio assoluto."
  },
  {
    imageUrl: "/lovable-uploads/ee63e6a9-208d-43f5-8bad-4c94f9c066cd.png",
    description: "Un premio così esclusivo che la sua vera natura rimarrà segreta fino all'ultimo momento. Solo i vincitori scopriranno il suo vero valore."
  },
  {
    imageUrl: "/lovable-uploads/55b484c2-04bc-4fb2-a650-1910fd650b89.png",
    description: "Un'esperienza irripetibile che trasformerà la tua vita, avvolta nel mistero fino all'ultimo istante."
  },
  {
    imageUrl: "/lovable-uploads/79b6f8b7-66b3-4dee-a705-0d3f0b1f16b9.png",
    description: "Un pezzo unico al mondo, creato da maestri artigiani per soddisfare i desideri più esclusivi."
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
