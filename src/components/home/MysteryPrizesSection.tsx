import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface MysteryPrize {
  imageUrl: string;
  description: string;
}

const mysteryPrizes = [
  {
    imageUrl: "/lovable-uploads/5a019ed0-63c1-47f8-a931-de097784d768.png",
    description: "Regolamento chiaro e trasparente per garantire un'esperienza equa per tutti i partecipanti."
  },
  {
    imageUrl: "/lovable-uploads/95a194d0-ba1a-4b76-85e4-6cc95fda46ab.png",
    description: "Un mese di indizi per svelare il mistero dell'auto in palio."
  },
  {
    imageUrl: "/lovable-uploads/cab356af-f03b-4b55-b5b3-ffc66c25841c.png",
    description: "Project X: L'esclusiva competizione per auto di lusso che trasforma i sogni in realtà."
  },
  {
    imageUrl: "/lovable-uploads/b83c1e65-cd66-46ad-937b-60d7fd0c6a63.png",
    description: "Unisciti a Project X: Il tuo sogno è a portata di mano con accesso anticipato agli indizi."
  },
  {
    imageUrl: "/lovable-uploads/a6250e9c-4a94-4357-b39c-e91ce9426e9e.png",
    description: "Vantaggi esclusivi per i membri premium con contenuti speciali e opportunità uniche."
  },
  {
    imageUrl: "/lovable-uploads/6ec76f7f-0e83-4005-8fb0-582ba83a7d60.png",
    description: "Il nostro target: appassionati di auto di lusso alla ricerca di emozioni uniche."
  },
  {
    imageUrl: "/lovable-uploads/a96033d6-a86e-4a83-a76a-ec3a24c56adf.png",
    description: "La nostra promessa: trasparenza e divertimento garantiti in ogni fase del gioco."
  },
  {
    imageUrl: "/lovable-uploads/ddb0368c-4853-49a4-b8e2-70abf7594e0d.png",
    description: "Registrazione gratuita vs. accesso premium: scegli il tuo livello di partecipazione."
  }
];

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
