
import { Event } from "@/data/eventData";
import EventCard from "./EventCard";
import { upcomingMysteryPrizes } from "@/data/mysteryPrizesData";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

// Premi associati per i prossimi eventi
const upcomingPrizes = [
  [
    {
      imageUrl: "/lovable-uploads/b349206f-bdf7-42e2-a1a6-b87988bc94f4.png",
      description: "Hermès Kelly Bag - Borsa Kelly 28 verde smeraldo, icona di eleganza e raffinatezza."
    }
  ],
  [
    {
      imageUrl: "/lovable-uploads/f6438a3c-d978-47ff-b010-4fd09dc9cc28.png",
      description: "McLaren 720S Spider - Supercar V8, 720 CV, 0-100 km/h in 2.9 secondi."
    }
  ],
  [
    {
      imageUrl: "/lovable-uploads/7f787e38-d579-4b24-8a57-1ede818cdca3.png",
      description: "Porsche Cayenne Turbo GT - Il SUV sportivo di Porsche, prestazioni estreme e lusso."
    }
  ],
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
          <div key={index}>
            <Carousel>
              <CarouselContent>
                {(upcomingPrizes[index] || []).map((prize, idx) => (
                  <CarouselItem key={idx} className="flex flex-col items-center justify-center">
                    <div className="w-full flex justify-center">
                      <img src={prize.imageUrl} alt={prize.description} className="rounded-md w-full max-w-xs h-44 object-cover border-2 border-projectx-neon-blue shadow-lg"/>
                    </div>
                    <p className="mt-2 text-sm text-center text-muted-foreground">{prize.description}</p>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
            <EventCard
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
          </div>
        ))}
      </div>
    </section>
  );
};

export default UpcomingEventsSection;
