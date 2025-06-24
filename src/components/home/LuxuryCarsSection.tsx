
import { Card } from "@/components/ui/card";
import FuturisticCarsCarousel from "./FuturisticCarsCarousel";

export default function LuxuryCarsSection() {
  return (
    <section className="w-full px-0 py-4">
      <h2 className="text-xl font-bold mb-4 px-4">Premi Auto di Lusso</h2>
      <div className="relative w-full p-2 rounded-xl bg-black/30 backdrop-blur-sm border border-white/10"
           style={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15), 0 0 8px rgba(0, 209, 255, 0.05)" }}>
        <FuturisticCarsCarousel />
      </div>
    </section>
  );
}
