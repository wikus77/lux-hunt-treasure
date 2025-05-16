
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card } from "@/components/ui/card";
import { useState } from "react";
import ImagePreview from "@/components/ui/image-preview";
import { useLongPress } from "@/hooks/useLongPress";

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
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => onClose()}>
        <DialogContent className="max-w-[90vw] w-[calc(100vw-2rem)] max-h-[85vh] overflow-y-auto bg-black border-2 border-projectx-blue rounded-xl">
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
                {images.map((image, index) => {
                  const longPressProps = useLongPress(() => setPreviewImage(image.url));
                  
                  return (
                    <CarouselItem key={index}>
                      <div className="p-1 flex flex-col items-center">
                        <Card className="overflow-hidden flex items-center justify-center">
                          {/* Set fixed height and improved object-fit for car images */}
                          <div 
                            className="w-full cursor-pointer"
                            {...longPressProps}
                            onDoubleClick={() => setPreviewImage(image.url)}
                            onContextMenu={(e) => {
                              e.preventDefault();
                              setPreviewImage(image.url);
                            }}
                          >
                            <img 
                              src={image.url} 
                              alt={image.description}
                              className="object-contain w-full h-[200px] md:h-[300px] lg:h-[380px] rounded-md bg-black"
                            />
                          </div>
                          <p className="p-4 text-sm text-muted-foreground text-center">{image.description}</p>
                        </Card>
                      </div>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>

            <div className="glass-card rounded-xl">
              <h3 className="text-lg font-bold mb-2">Dettagli dell'evento</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {description}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ImagePreview 
        isOpen={!!previewImage}
        onClose={() => setPreviewImage(null)}
        imageUrl={previewImage || ""}
        alt="Event image preview"
      />
    </>
  );
};

export default EventDetailsDialog;
