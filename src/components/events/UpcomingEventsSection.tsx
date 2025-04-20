
import { Event } from "@/data/eventData";
import EventCard from "./EventCard";

// Mystery prizes for upcoming events
const upcomingMysteryPrizes = [
  {
    imageUrl: "/lovable-uploads/b349206f-bdf7-42e2-a1a6-b87988bc94f4.png",
    description: "Un gioiello tecnologico dal valore inestimabile, custodito in una cassaforte ad alta sicurezza."
  },
  {
    imageUrl: "/lovable-uploads/7f787e38-d579-4b24-8a57-1ede818cdca3.png",
    description: "Un'esperienza esclusiva riservata solo ai vincitori, in una location top-secret."
  },
  {
    imageUrl: "/lovable-uploads/a987ba21-940e-48cd-b999-c266de3f133c.png",
    description: "Un oggetto del desiderio per collezionisti, dalla provenienza misteriosa e dal valore inestimabile."
  },
  {
    imageUrl: "/lovable-uploads/48b9a28f-59eb-4010-9bb2-37de88a4d7b1.png",
    description: "Un privilegio riservato a pochissimi eletti nel mondo, simbolo di status e raffinatezza."
  }
];

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
            mysteryPrizes={upcomingMysteryPrizes}
          />
        ))}
      </div>
    </section>
  );
};

export default UpcomingEventsSection;
