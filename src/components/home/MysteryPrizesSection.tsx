
import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { mysteryPrizes } from "@/data/mysteryPrizesData";

export const MysteryPrizesSection = () => {
  return (
    <section className="p-4">
      <h2 className="text-xl font-bold mb-4">Premi Misteriosi dei Prossimi Eventi</h2>
      <div className="relative">
        <Carousel>
          <CarouselContent>
            {mysteryPrizes.map((prize, index) => (
              <CarouselItem key={index}>
                <Card className="p-1">
                  <div 
                    className="h-48 bg-cover bg-center rounded-md" 
                    style={{ backgroundImage: `url(${prize.imageUrl})` }}
                  />
                  <p className="p-4 text-sm text-muted-foreground">
                    {prize.description}
                  </p>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2" />
          <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2" />
        </Carousel>
      </div>
    </section>
  );
};

export default MysteryPrizesSection;

