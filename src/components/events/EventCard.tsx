
import { CalendarDays } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import EventDetailsDialog from "./EventDetailsDialog";

interface EventImage {
  url: string;
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
  detailedDescription
}: EventCardProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Card className={`overflow-hidden ${isCurrent ? "neon-border" : "border-projectx-deep-blue"}`}>
        <div 
          className="h-40 bg-cover bg-center" 
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
        
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className={`text-lg ${isCurrent ? "neon-text" : ""}`}>{title}</CardTitle>
              <CardDescription>{carBrand} {carModel}</CardDescription>
            </div>
            {isCurrent && (
              <span className="px-2 py-1 text-xs rounded-full bg-projectx-pink text-white">
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
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm">
              <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>{date}</span>
            </div>
          </div>
          
          <Button 
            className="w-full bg-gradient-to-r from-projectx-blue to-projectx-pink"
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
