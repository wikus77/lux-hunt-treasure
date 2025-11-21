
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Tema colore e gradienti: blu-neon, viola, vetro e glow
interface GenderFilterProps {
  selectedGender: string;
  onGenderChange: (value: string) => void;
}

const GenderFilter = ({ selectedGender, onGenderChange }: GenderFilterProps) => {
  return (
    <div className="w-full flex justify-center px-4">
      <Select value={selectedGender} onValueChange={onGenderChange}>
        <SelectTrigger
          className={`
            w-64 h-12 rounded-xl border-2 border-[#00a3ff]
            bg-gradient-to-r from-[#181641ee] via-[#1eaedbaa] to-[#181641ee]
            text-white font-bold text-base relative shadow-[0_0_28px_#00a3ff88,0_1px_8px_0_#9b87f588]
            hover:from-[#1eaedbff] hover:to-[#a855f7bb] 
            focus:ring-2 focus:ring-[#00a3ff]
            backdrop-blur-lg glass-card
            transition-all duration-200
            drop-shadow-[0_0_16px_#00a3ff]
          `}
        >
          <SelectValue placeholder="Filtra per categoria" />
        </SelectTrigger>
        <SelectContent
          side="bottom"
          className={`
            w-64 rounded-xl border-2 border-[#00a3ff]
            bg-gradient-to-br from-[#141425fc] via-[#1eaedbaa] to-[#181641fc]
            text-white font-semibold backdrop-blur-2xl
            shadow-[0_0_24px_3px_#00a3ff88,0_1px_7px_#9b87f577]
            z-50 animate-fade-in glass-card
            mt-2
          `}
        >
          <SelectItem value="all" className="hover:bg-[#7E69AB77] hover:text-white rounded-lg px-4 py-2 transition-all duration-150">
            Tutti gli eventi
          </SelectItem>
          <SelectItem value="man" className="hover:bg-[#00a3ff99] hover:text-white rounded-lg px-4 py-2 transition-all duration-150">
            Player Man
          </SelectItem>
          <SelectItem value="woman" className="hover:bg-[#d946ef99] hover:text-white rounded-lg px-4 py-2 transition-all duration-150">
            Player Woman
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default GenderFilter;
