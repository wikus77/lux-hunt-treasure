
import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";

const futuristicCars = [
  {
    name: "Porsche 911 Turbo S",
    image: "https://vkjrqirvdvjbemsfzxof.supabase.co/storage/v1/object/public/images/cars/porsche-911-turbo-s.jpg",
    description: "Il premio principale della missione corrente",
    value: "€200,000"
  },
  {
    name: "Ferrari SF90 Stradale",
    image: "https://vkjrqirvdvjbemsfzxof.supabase.co/storage/v1/object/public/images/cars/ferrari-sf90.jpg", 
    description: "Premio speciale per il vincitore assoluto",
    value: "€500,000"
  },
  {
    name: "Lamborghini Huracán",
    image: "https://vkjrqirvdvjbemsfzxof.supabase.co/storage/v1/object/public/images/cars/lamborghini-huracan.jpg",
    description: "Premio mensile esclusivo",
    value: "€300,000"
  },
  {
    name: "McLaren 720S",
    image: "https://vkjrqirvdvjbemsfzxof.supabase.co/storage/v1/object/public/images/cars/mclaren-720s.jpg",
    description: "Premio per i primi 3 classificati",
    value: "€350,000"
  }
];

export default function FuturisticCarsCarousel() {
  return (
    <Carousel className="w-full">
      <CarouselContent>
        {futuristicCars.map((car, index) => (
          <CarouselItem key={index} className="w-full max-w-full">
            <Card className="p-1 w-full rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-[1.02]" 
                 style={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2), 0 0 8px rgba(0, 209, 255, 0.1)" }}>
              <div 
                className="h-48 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black rounded-lg w-full overflow-hidden"
              >
                <img
                  src={car.image}
                  alt={car.name}
                  className="object-cover h-full w-full transform hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1474&q=80";
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="font-bold text-lg text-white mb-1">{car.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{car.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-yellow-400">{car.value}</span>
                  <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-full">
                    PREMIO
                  </span>
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
}
