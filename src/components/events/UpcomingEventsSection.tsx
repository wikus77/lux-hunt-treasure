
import { Event } from "@/data/eventData";
import EventCard from "./EventCard";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

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
            <div className="mb-4">
              {/* Carousel slideshow, stile identico a Evento Corrente */}
              <Carousel>
                <CarouselContent>
                  {event.images.map((img, idx) => (
                    <CarouselItem key={idx} className="flex flex-col items-center justify-center">
                      <div className="w-full flex justify-center">
                        <img
                          src={img.url}
                          alt={img.description}
                          className="rounded-md w-full max-w-xs h-44 object-cover border-2 border-projectx-blue shadow-lg"
                        />
                      </div>
                      <p className="mt-2 text-sm text-center text-muted-foreground">{img.description}</p>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
            <EventCard
              title={event.title}
              carModel={event.carModel}
              carBrand={event.carBrand}
              date={event.date}
              imageUrl={event.imageUrl}
              description={event.description}
              images={event.images}
              detailedDescription={event.detailedDescription}
              isCurrent={event.isCurrent || false}
              mysteryPrizes={undefined}
            />
          </div>
        ))}
      </div>
    </section>
  );
};

export default UpcomingEventsSection;
