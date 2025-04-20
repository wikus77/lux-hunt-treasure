import { useState } from "react";
import BottomNavigation from "@/components/layout/BottomNavigation";
import EventCard from "@/components/events/EventCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Events = () => {
  const [selectedGender, setSelectedGender] = useState<string>("all");

  const currentEvent = {
    title: "Ferrari 488 GTB",
    carModel: "488 GTB",
    carBrand: "Ferrari",
    date: "19 Apr - 15 Mag 2025",
    imageUrl: "/events/ferrari-488-gtb.jpg",
    description: "Una supercar che combina potenza e bellezza in un design aerodinamico. Colore rosso fiammante con interni in pelle nera.",
    isCurrent: true,
    gender: "man",
    images: [
      {
        url: "/events/ferrari-488-1.jpg",
        description: "Vista frontale della Ferrari 488 GTB in rosso corsa, che mostra l'iconico design aerodinamico e le prese d'aria laterali scultoree."
      },
      {
        url: "/events/ferrari-488-2.jpg",
        description: "Dettaglio degli interni in pelle nera con cuciture rosse a contrasto e il caratteristico volante con indicatore LED dei giri motore."
      },
      {
        url: "/events/ferrari-488-3.jpg",
        description: "Vista posteriore che evidenzia il diffusore aerodinamico e i doppi scarichi, elementi caratteristici del design Ferrari."
      }
    ],
    detailedDescription: `La Ferrari 488 GTB rappresenta l'eccellenza del design e dell'ingegneria automobilistica italiana. 

Questa supercar è equipaggiata con un motore V8 biturbo da 3.9 litri che eroga una potenza di 670 CV, permettendo un'accelerazione da 0 a 100 km/h in soli 3 secondi.

Gli interni sono un perfetto connubio tra lusso sportivo e tecnologia avanzata, con sedili avvolgenti in pelle pregiata e un cockpit orientato al pilota.

Caratteristiche principali:
• Motore V8 biturbo da 3.9 litri
• 670 CV di potenza
• 0-100 km/h in 3.0 secondi
• Velocità massima: 330 km/h
• Sistema di controllo della dinamica SSC
• Aerodinamica attiva
`
  };
  
  const upcomingEvents = [
    {
      title: "Lamborghini Huracán",
      carModel: "Huracán",
      carBrand: "Lamborghini",
      date: "16 Mag - 15 Giu 2025",
      imageUrl: "/events/lamborghini-huracan.jpg",
      description: "Aggressiva e potente, questa Lamborghini Huracán in verde metallizzato incarna la perfezione del design italiano.",
      gender: "man",
      images: [
        {
          url: "/events/huracan-1.jpg",
          description: "Vista frontale della Huracán che mostra l'aggressivo design del frontale e i caratteristici fari LED esagonali."
        },
        {
          url: "/events/huracan-2.jpg",
          description: "Dettaglio del profilo laterale che evidenzia le linee spigolose e le prese d'aria caratteristiche."
        },
        {
          url: "/events/huracan-3.jpg",
          description: "Gli interni sportivi con il caratteristico quadro strumenti digitale e i dettagli in carbonio."
        }
      ],
      detailedDescription: `La Lamborghini Huracán è l'incarnazione della potenza e dell'aggressività nel mondo delle supercar.

Dotata di un possente motore V10 aspirato da 5.2 litri, questa belva italiana eroga 640 CV di pura potenza, garantendo prestazioni mozzafiato e un sound inconfondibile.

Il design esterno, caratterizzato da linee taglienti e spigoli vivi, riflette il DNA Lamborghini, mentre gli interni combinano lusso e tecnologia in un cockpit futuristico.

Specifiche tecniche:
• Motore V10 5.2L aspirato
• 640 CV di potenza
• Trazione integrale
• 0-100 km/h in 2.9 secondi
• Telaio ibrido in alluminio e fibra di carbonio
• Sistema di sterzo dinamico`
    },
    {
      title: "Porsche 911 Turbo",
      carModel: "911 Turbo",
      carBrand: "Porsche",
      date: "16 Giu - 15 Lug 2025",
      imageUrl: "/events/porsche-911.jpg",
      description: "Un'icona del design automobilistico, questa Porsche 911 Turbo in argento con cerchi neri rappresenta l'equilibrio perfetto tra potenza e raffinatezza.",
      gender: "woman",
      images: [
        {
          url: "/events/porsche-911-1.jpg",
          description: "Vista frontale della Porsche 911 Turbo in argento con cerchi neri, evidenziando il design aerodinamico e le linee taglienti."
        },
        {
          url: "/events/porsche-911-2.jpg",
          description: "Dettaglio degli interni in pelle nera con il caratteristico volante con indicatore LED dei giri motore."
        },
        {
          url: "/events/porsche-911-3.jpg",
          description: "Vista posteriore che evidenzia il diffusore aerodinamico e i doppi scarichi, elementi caratteristici del design Porsche."
        }
      ],
      detailedDescription: `La Porsche 911 Turbo è un'icona del design automobilistico e della potenza.

Dotata di un motore V8 biturbo da 3.6 litri, questa supercar eroga 450 CV di potenza, garantendo prestazioni straordinarie e un sound inconfondibile.

Il design esterno, caratterizzato da linee taglienti e spigoli vivi, riflette il DNA Porsche, mentre gli interni combinano lusso e tecnologia in un cockpit futuristico.

Specifiche tecniche:
• Motore V8 biturbo da 3.6L
• 450 CV di potenza
• Trazione integrale
• 0-100 km/h in 4.2 secondi
• Velocità massima: 320 km/h
• Sistema di controllo della dinamica
• Aerodinamica attiva`
    },
    {
      title: "Tesla Model S Plaid",
      carModel: "Model S Plaid",
      carBrand: "Tesla",
      date: "16 Lug - 15 Ago 2025",
      imageUrl: "/events/tesla-model-s.jpg",
      description: "Il futuro elettrico dell'automobilismo. Questa Tesla Model S Plaid in bianco perlato offre prestazioni straordinarie con zero emissioni.",
      gender: "woman",
      images: [
        {
          url: "/events/tesla-model-s-1.jpg",
          description: "Vista frontale della Tesla Model S Plaid in bianco perlato, evidenziando il design aerodinamico e le linee taglienti."
        },
        {
          url: "/events/tesla-model-s-2.jpg",
          description: "Dettaglio degli interni in pelle nera con il caratteristico volante con indicatore LED dei giri motore."
        },
        {
          url: "/events/tesla-model-s-3.jpg",
          description: "Vista posteriore che evidenzia il diffusore aerodinamico e i doppi scarichi, elementi caratteristici del design Tesla."
        }
      ],
      detailedDescription: `La Tesla Model S Plaid è il futuro elettrico dell'automobilismo.

Dotata di un motore elettrico di 1,000 CV, questa supercar offre prestazioni straordinarie con zero emissioni, garantendo prestazioni mozzafiato e un sound inconfondibile.

Il design esterno, caratterizzato da linee taglienti e spigoli vivi, riflette il DNA Tesla, mentre gli interni combinano lusso e tecnologia in un cockpit futuristico.

Specifiche tecniche:
• Motore elettrico di 1,000 CV
• 0-100 km/h in 2.1 secondi
• Velocità massima: 350 km/h
• Sistema di controllo della dinamica
• Aerodinamica attiva`
    },
    {
      title: "Ferrari SF90 Stradale",
      carModel: "SF90 Stradale",
      carBrand: "Ferrari",
      date: "16 Ago - 15 Set 2025",
      imageUrl: "/events/ferrari-sf90.jpg",
      description: "L'ibrida più potente di Ferrari. Questa SF90 Stradale in giallo combina un V8 biturbo con tre motori elettrici per prestazioni senza precedenti.",
      gender: "man",
      images: [
        {
          url: "/events/ferrari-sf90-1.jpg",
          description: "Vista frontale della SF90 Stradale in giallo, evidenziando il design aerodinamico e le linee taglienti."
        },
        {
          url: "/events/ferrari-sf90-2.jpg",
          description: "Dettaglio degli interni in pelle nera con il caratteristico volante con indicatore LED dei giri motore."
        },
        {
          url: "/events/ferrari-sf90-3.jpg",
          description: "Vista posteriore che evidenzia il diffusore aerodinamico e i doppi scarichi, elementi caratteristici del design Ferrari."
        }
      ],
      detailedDescription: `La Ferrari SF90 Stradale è l'ibrida più potente di Ferrari.

Dotata di un motore V8 biturbo da 3.9 litri e tre motori elettrici, questa supercar offre prestazioni senza precedenti, garantendo prestazioni mozzafiato e un sound inconfondibile.

Il design esterno, caratterizzato da linee taglienti e spigoli vivi, riflette il DNA Ferrari, mentre gli interni combinano lusso e tecnologia in un cockpit futuristico.

Specifiche tecniche:
• Motore V8 biturbo da 3.9L
• 1,000 CV di potenza
• 0-100 km/h in 2.5 secondi
• Velocità massima: 350 km/h
• Sistema di controllo della dinamica
• Aerodinamica attiva`
    }
  ];

  const filteredEvents = upcomingEvents.filter(event => 
    selectedGender === 'all' || event.gender === selectedGender
  );

  return (
    <div className="pb-20 min-h-screen bg-black">
      {/* Header */}
      <header className="px-4 py-6 flex justify-between items-center border-b border-m1ssion-deep-blue">
        <h1 className="text-2xl font-bold neon-text">Eventi</h1>
      </header>

      {/* Gender Filter */}
      <div className="p-4">
        <Select value={selectedGender} onValueChange={setSelectedGender}>
          <SelectTrigger className="w-full md:w-[200px] bg-black border-m1ssion-deep-blue">
            <SelectValue placeholder="Filtra per categoria" />
          </SelectTrigger>
          <SelectContent className="bg-black border border-m1ssion-deep-blue">
            <SelectItem value="all">Tutti gli eventi</SelectItem>
            <SelectItem value="man">Player Man</SelectItem>
            <SelectItem value="woman">Player Woman</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Current Event */}
      <section className="p-4">
        <h2 className="text-xl font-bold mb-4">Evento Corrente</h2>
        <EventCard
          title={currentEvent.title}
          carModel={currentEvent.carModel}
          carBrand={currentEvent.carBrand}
          date={currentEvent.date}
          imageUrl={currentEvent.imageUrl}
          description={currentEvent.description}
          isCurrent={currentEvent.isCurrent}
          images={currentEvent.images}
          detailedDescription={currentEvent.detailedDescription}
        />
      </section>

      {/* Upcoming Events */}
      <section className="p-4">
        <h2 className="text-xl font-bold mb-4">Prossimi Eventi</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredEvents.map((event, index) => (
            <EventCard
              key={index}
              title={event.title}
              carModel={event.carModel}
              carBrand={event.carBrand}
              date={event.date}
              imageUrl={event.imageUrl}
              description={event.description}
              images={event.images}
              detailedDescription={event.detailedDescription}
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

      <BottomNavigation />
    </div>
  );
};

export default Events;
