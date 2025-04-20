
import { Event } from "@/data/eventData";
import EventCard from "./EventCard";

const mysteryPrizes = [
  {
    imageUrl: "/lovable-uploads/781937e4-2515-4cad-8393-c51c1c81d6c9.png",
    description: "Un esclusivo accessorio di lusso che rappresenta l'eccellenza del design italiano."
  },
  {
    imageUrl: "/lovable-uploads/9daa7fae-5be8-482a-8136-7113724b28ad.png",
    description: "Un capolavoro dell'ingegneria che combina prestazioni ed eleganza."
  },
  {
    imageUrl: "/lovable-uploads/b79099f5-31ab-44a3-b271-9cde8b7932e1.png",
    description: "Un oggetto iconico che incarna lo stile senza tempo e il prestigio."
  },
  {
    imageUrl: "/lovable-uploads/ee63e6a9-208d-43f5-8bad-4c94f9c066cd.png",
    description: "Un premio misterioso che rappresenta il massimo dell'esclusività e del lusso."
  }
];

interface CurrentEventSectionProps {
  currentEvent: Event;
}

const CurrentEventSection = ({ currentEvent }: CurrentEventSectionProps) => {
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
        mysteryPrizes={mysteryPrizes}
      />
    </section>
  );
};

export default CurrentEventSection;
