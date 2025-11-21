
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface MysteryPrize {
  imageUrl: string;
  description: string;
}

interface EventPrizeCarouselProps {
  prizes: MysteryPrize[];
}

const EventPrizeCarousel = ({ prizes }: EventPrizeCarouselProps) => {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold mb-2">Premi Misteriosi in Palio</h3>
      <Carousel className="w-full">
        <CarouselContent>
          {prizes.map((prize, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <div 
                  className="h-32 bg-cover bg-center rounded-lg mb-2" 
                  style={{ backgroundImage: `url(${prize.imageUrl})` }}
                />
                <p className="text-xs text-muted-foreground text-center">
                  {prize.description}
                </p>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2" />
        <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2" />
      </Carousel>
    </div>
  );
};

export default EventPrizeCarousel;
