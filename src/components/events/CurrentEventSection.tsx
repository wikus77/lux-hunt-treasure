
import { Event } from "@/data/eventData";
import EventCard from "./EventCard";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { upcomingMysteryPrizes } from "@/data/mysteryPrizesData";

// Cambiato il titolo a "Prossimi Eventi" e applicato styling futuristico
interface CurrentEventSectionProps {
  currentEvent: Event;
}

const CurrentEventSection = ({ currentEvent }: CurrentEventSectionProps) => {
  return (
    <section className="p-4 w-full">
      <h2 className="text-2xl sm:text-3xl font-extrabold mb-6
        bg-gradient-to-r from-[#00a3ff] via-[#7E69AB] to-[#d946ef]
        text-transparent bg-clip-text [text-fill-color:transparent] 
        drop-shadow-[0_0_22px_#33c3f0]
        tracking-tight"
        style={{
          letterSpacing: "0.03em",
          textShadow: "0 0 16px #00a3ff, 0 0 28px #9b87f5"
        }}>
        Prossimi Eventi
      </h2>
      <div className="mb-4">
        {/* Carousel slideshow immagini */}
        <Carousel>
          <CarouselContent>
            {currentEvent.images.map((img, idx) => (
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
      <div
        className="m1-relief relative overflow-hidden rounded-[24px] animate-fade-in"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-amber-500 opacity-90" />
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
          mysteryPrizes={upcomingMysteryPrizes}
          gender={currentEvent.gender} // Added the required gender prop
        />
      </div>
    </section>
  );
};

export default CurrentEventSection;
