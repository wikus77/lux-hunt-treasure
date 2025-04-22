
import { Event } from "@/data/eventData";
import EventCard from "./EventCard";
import { mysteryPrizes } from "@/data/mysteryPrizesData";

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
