
import { CalendarDays } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import EventDetailsDialog from "./EventDetailsDialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

interface EventImage {
  url: string;
  description: string;
}

interface MysteryPrize {
  imageUrl: string;
  description: string;
}

interface EventCardProps {
  title: string;
  carModel: string;
  carBrand: string;
  date: string;
  imageUrl: string;
  description?: string;
  isCurrent?: boolean;
  images: EventImage[];
  detailedDescription: string;
  mysteryPrizes?: MysteryPrize[];
}

export const EventCard = ({ 
  title, 
  carModel, 
  carBrand, 
  date,
  imageUrl, 
  description,
  isCurrent = false,
  images,
  detailedDescription,
  mysteryPrizes
}: EventCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Card className={`overflow-hidden ${isCurrent ? "neon-border" : "border-m1ssion-deep-blue"}`}>
        <div 
          className="h-48 bg-cover bg-center" 
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className={`text-lg ${isCurrent ? "neon-text" : ""}`}>{title}</CardTitle>
              <CardDescription>{carBrand} {carModel}</CardDescription>
            </div>
            {isCurrent && (
              <span className="px-2 py-1 text-xs rounded-full bg-m1ssion-pink text-white">
                In corso
              </span>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {description && (
            <p className="text-sm text-muted-foreground mb-3">
              {description}
            </p>
          )}
          
          {isCurrent && mysteryPrizes && mysteryPrizes.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2">Premi Misteriosi in Palio</h3>
              <Carousel className="w-full">
                <CarouselContent>
                  {mysteryPrizes.map((prize, index) => (
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
          )}
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm">
              <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{date}</span>
            </div>
          </div>
          
          <Button 
            className="w-full bg-gradient-to-r from-m1ssion-blue to-m1ssion-pink"
            onClick={() => setIsDialogOpen(true)}
          >
            Visualizza dettagli
          </Button>
        </CardContent>
      </Card>

      <EventDetailsDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={title}
        carModel={carModel}
        carBrand={carBrand}
        date={date}
        description={detailedDescription}
        images={images}
      />
    </>
  );
};

export default EventCard;
