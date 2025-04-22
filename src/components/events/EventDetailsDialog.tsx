
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
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto bg-black border-2 border-projectx-blue">
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
                  <div className="p-1 flex flex-col items-center">
                    <Card className="overflow-hidden flex items-center justify-center">
                      {/* Use object-contain and a max-height for car images */}
                      <img 
                        src={image.url} 
                        alt={image.description}
                        className="object-contain w-full max-h-[380px] rounded-md bg-black"
                        style={{ backgroundColor: "#000" }}
                      />
                      <p className="p-4 text-sm text-muted-foreground text-center">{image.description}</p>
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
