
import { Event } from "@/data/eventData";
import EventCard from "./EventCard";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { upcomingMysteryPrizes } from "@/data/mysteryPrizesData";
import FuturisticSectionTitle from "./FuturisticSectionTitle";

interface UpcomingEventsSectionProps {
  events: Event[];
}

const UpcomingEventsSection = ({ events }: UpcomingEventsSectionProps) => {
  return (
    <section className="p-4 w-full">
      <FuturisticSectionTitle>Prossimi Eventi</FuturisticSectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {events.map((event, index) => (
          <section
            key={index}
            className="glass-card border-[2.5px] neon-border rounded-2xl shadow-2xl animate-fade-in
                       bg-gradient-to-br from-[#111124d8] via-[#1eaedb10] to-[#181641d8]
                       flex flex-col justify-between px-0"
            style={{
              boxShadow: "0 0 22px 3px #00a3ff99, 0 0 44px 6px #9b87f599, 0 1px 3px 0 #12004525",
              borderColor: "#00a3ff"
            }}
          >
            <div className="mb-4">
              <Carousel>
                <CarouselContent>
                  {event.images.map((img, idx) => (
                    <CarouselItem key={idx} className="flex flex-col items-center justify-center">
                      <div className="w-full flex justify-center">
                        <img
                          src={img.url}
                          alt={img.description}
                          className="rounded-xl w-full max-w-md h-56 sm:h-64 object-cover border-4 border-[#00a3ff]/60 shadow-[0_0_32px_2px_#00a3ff99] 
                                 dark:bg-[#181641]/80 bg-white/10 animate-fade-in"
                          style={{
                            filter: "drop-shadow(0 0 18px #1155ff44)"
                          }}
                        />
                      </div>
                      <p className="mt-4 text-base text-center text-[#c0caff] italic drop-shadow-[0_0_8px_#181641]" style={{
                        textShadow: "0 0 8px #1eaedb80"
                      }}>{img.description}</p>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>
            <div className="flex flex-col grow">
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
                mysteryPrizes={event.mysteryPrizes}
                gender={event.gender} // Added the required gender prop
              />
            </div>
          </section>
        ))}
      </div>
    </section>
  );
};

export default UpcomingEventsSection;
