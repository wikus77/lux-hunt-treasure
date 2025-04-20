
import { CalendarDays, MapPin } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface EventCardProps {
  title: string;
  carModel: string;
  carBrand: string;
  date: string;
  location: string;
  imageUrl: string;
  description?: string;
  isCurrent?: boolean;
}

export const EventCard = ({ 
  title, 
  carModel, 
  carBrand, 
  date, 
  location, 
  imageUrl, 
  description,
  isCurrent = false 
}: EventCardProps) => {
  return (
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
        
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{date}</span>
          </div>
          
          <div className="flex items-center text-sm">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{location}</span>
          </div>
        </div>
        
        {isCurrent && (
          <button className="w-full mt-4 py-2 text-sm bg-gradient-to-r from-projectx-blue to-projectx-pink rounded-md">
            Visualizza dettagli
          </button>
        )}
      </CardContent>
    </Card>
  );
};

export default EventCard;
