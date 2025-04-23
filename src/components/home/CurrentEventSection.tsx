import { Button } from "@/components/ui/button";
import { Calendar, ChevronRight } from "lucide-react";
import { currentEvent } from "@/data/eventData";
import CountdownTimer from "./CountdownTimer";
import { useNavigate } from "react-router-dom";
import FuturisticSectionTitle from "@/components/events/FuturisticSectionTitle";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { upcomingMysteryPrizes } from "@/data/mysteryPrizesData";

export const CurrentEventSection = () => {
  const navigate = useNavigate();

  return (
    <section className="w-full px-0 py-4">
      <div className="mb-4 px-4 w-full">
        <FuturisticSectionTitle>Evento Corrente</FuturisticSectionTitle>
      </div>
      <div className="mb-6">
        {/* Carousel immagini supercar */}
        <Carousel>
          <CarouselContent>
            {currentEvent.images.map((img, idx) => (
              <CarouselItem key={idx} className="flex flex-col items-center justify-center">
                <div className="w-full flex justify-center">
                  <img
                    src={img.url}
                    alt={img.description}
                    className="rounded-xl w-full max-w-md h-56 sm:h-64 object-cover border-4 border-[#00a3ff]/60 shadow-[0_0_32px_2px_#00a3ff99] 
                    dark:bg-[#181641]/80 bg-white/10 animate-fade-in"
                    style={{
                      filter: "drop-shadow(0 0 18px #1155ff44)"
                    }}
                  />
                </div>
                <p className="mt-4 text-base text-center text-[#c0caff] italic drop-shadow-[0_0_8px_#181641]" style={{
                  textShadow: "0 0 8px #1eaedb80"
                }}>{img.description}</p>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
      <div
        className="glass-card border-[2.5px] neon-border p-0 rounded-2xl shadow-2xl animate-fade-in bg-gradient-to-br from-[#111124d8] via-[#1eaedb10] to-[#181641d8]"
        style={{
          boxShadow:
            "0 0 22px 3px #00a3ff99, 0 0 44px 6px #9b87f599, 0 1px 3px 0 #12004525",
          borderColor: "#00a3ff"
        }}
      >
        <div className="px-4 py-2">
          <p className="text-lg text-center font-bold text-white mb-3">{currentEvent.title}</p>
          <p className="text-base text-center text-[#c0caff] italic mb-2">{currentEvent.description}</p>
          {/* Premi misteriosi */}
          <div className="mb-3">
            <span className="block text-base font-semibold text-[#7E69AB] mb-1">Premi Misteriosi in Palio</span>
            <Carousel className="w-full">
              <CarouselContent>
                {upcomingMysteryPrizes.map((prize, idx) => (
                  <CarouselItem key={idx} className="flex flex-col items-center justify-center">
                    <img
                      src={prize.imageUrl}
                      alt={prize.description}
                      className="rounded-lg w-32 h-20 object-cover border-2 border-[#00a3ff77] shadow-md mb-2"
                    />
                    <span className="text-xs text-[#c0caff] text-center">{prize.description}</span>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CurrentEventSection;
