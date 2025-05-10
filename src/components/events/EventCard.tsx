
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import EventDetailsDialog from "./EventDetailsDialog";
import EventCardHeader from "./EventCardHeader";
import EventPrizeCarousel from "./EventPrizeCarousel";
import EventDateInfo from "./EventDateInfo";
import { upcomingMysteryPrizes } from "@/data/mysteryPrizesData";

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
  gender: "man" | "woman"; // Added gender prop to match what's being passed in EventsPage.tsx
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
  mysteryPrizes,
  gender, // Added gender to destructuring
}: EventCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Use upcomingMysteryPrizes from the data file if no mysteryPrizes are provided
  const prizes = mysteryPrizes || upcomingMysteryPrizes;

  return (
    <>
      <Card className={`overflow-hidden ${isCurrent ? "neon-border" : "border-m1ssion-deep-blue"}`}>
        <div 
          className="h-48 bg-cover bg-center" 
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        
        <EventCardHeader 
          title={title} 
          carBrand={carBrand} 
          carModel={carModel} 
          isCurrent={isCurrent} 
        />
        
        <CardContent>
          {description && (
            <p className="text-sm text-muted-foreground mb-3">
              {description}
            </p>
          )}
          
          {prizes && prizes.length > 0 && (
            <EventPrizeCarousel prizes={prizes} />
          )}
          
          <EventDateInfo date={date} />
          
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
