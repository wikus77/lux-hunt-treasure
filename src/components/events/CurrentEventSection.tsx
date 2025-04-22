
import { Event } from "@/data/eventData";
import EventCard from "./EventCard";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

// Substitute prizes with more realistic "event prizes", include detailed gallery
const prizeOptions = [
  {
    imageUrl: "/lovable-uploads/d6dc12b2-928f-4448-b728-f5e59b6175a8.png", // Ferrari 488
    description: "Ferrari 488 GTB - V8 biturbo da 670 CV, 0-100 km/h in 3 secondi."
  },
  {
    imageUrl: "/lovable-uploads/159027e7-9756-49fa-a771-b886e6c8f8e9.png", // Lamborghini Huracan
    description: "Lamborghini Huracán - V10 aspirato da 640 CV, design aggressivo e esclusivo."
  },
  {
    imageUrl: "/lovable-uploads/ada1e8fe-3f53-4dd3-bfbe-ae57b80a641d.png", // Porsche 992
    description: "Porsche 911 (992) - Leggendaria sportiva con 450 CV di potenza pura."
  },
  {
    imageUrl: "/lovable-uploads/6839ccb5-1ce7-485c-93e9-f2096e14774b.png", // Tesla Model S
    description: "Tesla Model S Plaid - Auto elettrica con 1.020 CV e accelerazione fulminea."
  },
  {
    imageUrl: "/lovable-uploads/507c2f6d-4ed0-46dc-b53c-79e1d5b7515e.png", // Ferrari SF 90
    description: "Ferrari SF90 Stradale - Ibrida con 1.000 CV, gioiello tecnologico di Maranello."
  },
  {
    imageUrl: "/lovable-uploads/42b25071-8e68-4f8e-8897-06a6b2bdb8f4.png",
    description: "Patek Philippe Nautilus - L'orologio di lusso in palio con cassa in oro rosa, quadrante blu, opera d'arte senza tempo."
  },
];

interface CurrentEventSectionProps {
  currentEvent: Event;
}

const CurrentEventSection = ({ currentEvent }: CurrentEventSectionProps) => {
  return (
    <section className="p-4">
      <h2 className="text-xl font-bold mb-4">Evento Corrente</h2>
      <div className="mb-4">
        <Carousel>
          <CarouselContent>
            {prizeOptions.map((prize, idx) => (
              <CarouselItem key={idx} className="flex flex-col items-center justify-center">
                <div className="w-full flex justify-center">
                  <img src={prize.imageUrl} alt={prize.description} className="rounded-md w-full max-w-xs h-44 object-cover border-2 border-projectx-neon-blue shadow-lg"/>
                </div>
                <p className="mt-2 text-sm text-center text-muted-foreground">{prize.description}</p>
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
        mysteryPrizes={prizeOptions}
      />
    </section>
  );
};

export default CurrentEventSection;

