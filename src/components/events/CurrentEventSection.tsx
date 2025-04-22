
import { Event } from "@/data/eventData";
import EventCard from "./EventCard";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

interface CurrentEventSectionProps {
  currentEvent: Event;
}

const CurrentEventSection = ({ currentEvent }: CurrentEventSectionProps) => {
  return (
    <section className="p-4">
      <h2 className="text-xl font-bold mb-4">Evento Corrente</h2>
      <div className="mb-4">
        {/* Carousel slideshow di supercar */}
        <Carousel>
          <CarouselContent>
            {currentEvent.images.map((img, idx) => (
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
        title={currentEvent.title}
        carModel={currentEvent.carModel}
        carBrand={currentEvent.carBrand}
        date={currentEvent.date}
        imageUrl={currentEvent.imageUrl}
        description={currentEvent.description}
        isCurrent={currentEvent.isCurrent}
        images={currentEvent.images}
        detailedDescription={currentEvent.detailedDescription}
        mysteryPrizes={undefined}
      />
    </section>
  );
};

export default CurrentEventSection;
