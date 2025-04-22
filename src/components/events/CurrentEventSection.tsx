
import { Event } from "@/data/eventData";
import EventCard from "./EventCard";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface CurrentEventSectionProps {
  currentEvent: Event;
}

const CurrentEventSection = ({ currentEvent }: CurrentEventSectionProps) => {
  // Create an array of prize options from the same event
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
    }
  ];

  return (
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
        mysteryPrizes={prizeOptions}
      />
    </section>
  );
};

export default CurrentEventSection;
