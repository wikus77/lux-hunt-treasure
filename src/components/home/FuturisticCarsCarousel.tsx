
import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const futuristicCars = [
  {
    name: "Porsche 911 GT3 RS",
    imageUrl: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop",
    description: "Prestazioni da pista per l'uso stradale"
  },
  {
    name: "BMW M4 Competition",
    imageUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop",
    description: "Potenza e precisione tedesche"
  },
  {
    name: "Mercedes-AMG GT R",
    imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop",
    description: "La belva verde di Affalterbach"
  },
  {
    name: "McLaren 720S",
    imageUrl: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop",
    description: "Velocità supersonica su strada"
  },
  {
    name: "Lamborghini Huracán",
    imageUrl: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop",
    description: "Passione italiana a 10 cilindri"
  }
];

const FuturisticCarsCarousel = () => {
  return (
    <Carousel className="w-full">
      <CarouselContent>
        {futuristicCars.map((car, index) => (
          <CarouselItem key={index} className="w-full max-w-full">
            <Card className="p-1 w-full rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" 
                 style={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2), 0 0 8px rgba(0, 209, 255, 0.1)" }}>
              <div 
                className="h-48 bg-cover bg-center flex items-end p-4 bg-black rounded-lg w-full"
                style={{ backgroundImage: `url(${car.imageUrl})` }}
              >
                <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 w-full">
                  <h3 className="text-white font-bold">{car.name}</h3>
                  <p className="text-gray-300 text-sm">{car.description}</p>
                </div>
              </div>
            </Card>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2" />
      <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2" />
    </Carousel>
  );
};

export default FuturisticCarsCarousel;
