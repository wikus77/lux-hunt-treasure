
import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { mysteryPrizes } from "@/data/mysteryPrizesData";

export const MysteryPrizesSection = () => {
  return (
    <section className="w-full px-0 py-4">
      <h2 className="text-xl font-bold mb-4 px-4">Premi Misteriosi dei Prossimi Eventi</h2>
      <div className="relative w-full p-2 rounded-xl bg-black/30 backdrop-blur-sm border border-white/10"
           style={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15), 0 0 8px rgba(0, 209, 255, 0.05)" }}>
        <Carousel className="w-full">
          <CarouselContent>
            {mysteryPrizes.map((prize, index) => (
              <CarouselItem key={index} className="w-full max-w-full">
                <Card className="p-1 w-full rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" 
                     style={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2), 0 0 8px rgba(0, 209, 255, 0.1)" }}>
                  <div 
                    className="h-48 flex items-center justify-center bg-black rounded-lg w-full overflow-hidden"
                  >
                    <img
                      src={prize.imageUrl}
                      alt={prize.description}
                      className="object-contain h-full w-full transform hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <p className="p-4 text-sm text-muted-foreground text-center">
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
