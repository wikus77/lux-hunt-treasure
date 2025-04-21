
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GenderFilterProps {
  selectedGender: string;
  onGenderChange: (value: string) => void;
}

const GenderFilter = ({ selectedGender, onGenderChange }: GenderFilterProps) => {
  return (
    <div className="w-screen max-w-none px-0 mx-[-16px] sm:mx-[-32px]">
      <Select value={selectedGender} onValueChange={onGenderChange}>
        <SelectTrigger 
          className="w-screen max-w-none bg-black border-m1ssion-deep-blue h-12 rounded-none text-white"
          style={{ width: "100vw", minWidth: "100vw", left: "50%", right: "50%", transform: "translateX(-50%)" }}
        >
          <SelectValue placeholder="Filtra per categoria" />
        </SelectTrigger>
        <SelectContent
          className="w-screen max-w-none bg-black border border-m1ssion-deep-blue z-50 text-white"
          style={{ width: "100vw", minWidth: "100vw", left: "50%", right: "50%", transform: "translateX(-50%)" }}
        >
          <SelectItem value="all">Tutti gli eventi</SelectItem>
          <SelectItem value="man">Player Man</SelectItem>
          <SelectItem value="woman">Player Woman</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default GenderFilter;

