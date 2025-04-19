
import BottomNavigation from "@/components/layout/BottomNavigation";
import EventCard from "@/components/events/EventCard";

const Events = () => {
  // Dati di esempio per gli eventi
  const currentEvent = {
    title: "Ferrari 488 GTB",
    carModel: "488 GTB",
    carBrand: "Ferrari",
    date: "19 Apr - 15 Mag 2025",
    location: "Milano, Italia",
    imageUrl: "/public/lovable-uploads/781937e4-2515-4cad-8393-c51c1c81d6c9.png",
    isCurrent: true
  };
  
  const upcomingEvents = [
    {
      title: "Lamborghini Huracán",
      carModel: "Huracán",
      carBrand: "Lamborghini",
      date: "16 Mag - 15 Giu 2025",
      location: "Roma, Italia",
      imageUrl: "/public/lovable-uploads/9daa7fae-5be8-482a-8136-7113724b28ad.png"
    },
    {
      title: "Porsche 911 Turbo",
      carModel: "911 Turbo",
      carBrand: "Porsche",
      date: "16 Giu - 15 Lug 2025",
      location: "Napoli, Italia",
      imageUrl: "/public/lovable-uploads/a987ba21-940e-48cd-b999-c266de3f133c.png"
    },
    {
      title: "Tesla Model S Plaid",
      carModel: "Model S Plaid",
      carBrand: "Tesla",
      date: "16 Lug - 15 Ago 2025",
      location: "Torino, Italia",
      imageUrl: "/public/lovable-uploads/ee63e6a9-208d-43f5-8bad-4c94f9c066cd.png"
    },
    {
      title: "Ferrari SF90 Stradale",
      carModel: "SF90 Stradale",
      carBrand: "Ferrari",
      date: "16 Ago - 15 Set 2025",
      location: "Firenze, Italia",
      imageUrl: "/public/lovable-uploads/b79099f5-31ab-44a3-b271-9cde8b7932e1.png"
    }
  ];

  return (
    <div className="pb-20 min-h-screen bg-black">
      {/* Header */}
      <header className="px-4 py-6 flex justify-between items-center border-b border-projectx-deep-blue">
        <h1 className="text-2xl font-bold neon-text">Eventi</h1>
      </header>

      {/* Current Event */}
      <section className="p-4">
        <h2 className="text-xl font-bold mb-4">Evento Corrente</h2>
        
        <EventCard
          title={currentEvent.title}
          carModel={currentEvent.carModel}
          carBrand={currentEvent.carBrand}
          date={currentEvent.date}
          location={currentEvent.location}
          imageUrl={currentEvent.imageUrl}
          isCurrent={currentEvent.isCurrent}
        />
      </section>

      {/* Upcoming Events */}
      <section className="p-4">
        <h2 className="text-xl font-bold mb-4">Prossimi Eventi</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {upcomingEvents.map((event, index) => (
            <EventCard
              key={index}
              title={event.title}
              carModel={event.carModel}
              carBrand={event.carBrand}
              date={event.date}
              location={event.location}
              imageUrl={event.imageUrl}
            />
          ))}
        </div>
      </section>

      {/* Event Rules */}
      <section className="p-4 mt-4">
        <div className="glass-card">
          <h2 className="text-xl font-bold mb-4">Regole degli Eventi</h2>
          
          <div className="space-y-4 text-sm text-muted-foreground">
            <p>
              Ogni evento dura 4 settimane, durante le quali i partecipanti ricevono indizi per trovare l'auto di lusso in palio.
            </p>
            
            <p>
              Gli indizi vengono rilasciati settimanalmente. Gli utenti con abbonamenti premium ricevono indizi aggiuntivi che aumentano le loro possibilità di vittoria.
            </p>
            
            <p>
              Il vincitore è il primo partecipante che riesce a localizzare correttamente l'auto basandosi sugli indizi ricevuti.
            </p>
            
            <p>
              L'estrazione mensile è certificata da un ente esterno, garantendo la correttezza e l'imparzialità del processo.
            </p>
          </div>
        </div>
      </section>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Events;
