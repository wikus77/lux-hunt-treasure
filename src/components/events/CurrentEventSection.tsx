
import { Event } from "@/data/eventData";
import EventCard from "./EventCard";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

// Substitute prizes with more realistic "event prizes", include detailed gallery
const prizeOptions = [
  {
    imageUrl: "/events/ferrari-488-gtb.jpg",
    description: "Ferrari 488 GTB - V8 biturbo da 670 CV, 0-100 km/h in 3 secondi."
  },
  {
    imageUrl: "/events/lamborghini-huracan.jpg",
    description: "Lamborghini Huracán - V10 aspirato da 640 CV, design aggressivo e esclusivo."
  },
  {
    imageUrl: "/events/porsche-911.jpg",
    description: "Porsche 911 (992) - Leggendaria sportiva con 450 CV di potenza pura."
  },
  {
    imageUrl: "/events/tesla-model-s.jpg",
    description: "Tesla Model S Plaid - Auto elettrica con 1.020 CV e accelerazione fulminea."
  },
  {
    imageUrl: "/events/ferrari-sf90.jpg",
    description: "Ferrari SF90 Stradale - Ibrida con 1.000 CV, gioiello tecnologico di Maranello."
  },
  {
    imageUrl: "/lovable-uploads/42b25071-8e68-4f8e-8897-06a6b2bdb8f4.png",
    description: "Patek Philippe Nautilus - L'orologio di lusso in palio con cassa in oro rosa, quadrante blu, opera d'arte senza tempo."
  },
];

interface CurrentEventSectionProps {
  currentEvent: Event;
}

const CurrentEventSection = ({ currentEvent }: CurrentEventSectionProps) => {
  return (
    <section className="p-4">
      <h2 className="text-xl font-bold mb-4">Evento Corrente</h2>
      <div className="mb-4">
        <Carousel>
          <CarouselContent>
            {prizeOptions.map((prize, idx) => (
              <CarouselItem key={idx} className="flex flex-col items-center justify-center">
                <div className="w-full flex justify-center">
                  <img src={prize.imageUrl} alt={prize.description} className="rounded-md w-full max-w-xs h-44 object-cover border-2 border-projectx-neon-blue shadow-lg"/>
                </div>
                <p className="mt-2 text-sm text-center text-muted-foreground">{prize.description}</p>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
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
        mysteryPrizes={prizeOptions}
      />
    </section>
  );
};

export default CurrentEventSection;
