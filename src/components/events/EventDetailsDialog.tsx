
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";

interface EventImage {
  url: string;
  description: string;
}

interface EventDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  carModel: string;
  carBrand: string;
  date: string;
  description: string;
  images: EventImage[];
}

export const EventDetailsDialog = ({
  isOpen,
  onClose,
  title,
  carModel,
  carBrand,
  date,
  description,
  images
}: EventDetailsDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto bg-black border border-projectx-deep-blue">
        <DialogHeader>
          <DialogTitle className="text-2xl neon-text">{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-sm text-muted-foreground">
            <p className="mb-2">{carBrand} {carModel}</p>
            <p>{date}</p>
          </div>

          <Carousel className="w-full">
            <CarouselContent>
              {images.map((image, index) => (
                <CarouselItem key={index}>
                  <div className="p-1">
                    <Card className="overflow-hidden">
                      <div 
                        className="h-[300px] bg-cover bg-center" 
                        style={{ backgroundImage: `url(${image.url})` }}
                      />
                      <p className="p-4 text-sm text-muted-foreground">
                        {image.description}
                      </p>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>

          <div className="glass-card">
            <h3 className="text-lg font-bold mb-2">Dettagli dell'evento</h3>
            <p className="text-sm text-muted-foreground whitespace-pre-line">
              {description}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsDialog;
