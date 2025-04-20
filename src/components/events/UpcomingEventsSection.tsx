
import { Event } from "@/data/eventData";
import EventCard from "./EventCard";

interface UpcomingEventsSectionProps {
  events: Event[];
}

const UpcomingEventsSection = ({ events }: UpcomingEventsSectionProps) => {
  return (
    <section className="p-4">
      <h2 className="text-xl font-bold mb-4">Prossimi Eventi</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {events.map((event, index) => (
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
  );
};

export default UpcomingEventsSection;

