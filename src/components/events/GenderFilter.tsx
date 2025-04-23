
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GenderFilterProps {
  selectedGender: string;
  onGenderChange: (value: string) => void;
}

const GenderFilter = ({ selectedGender, onGenderChange }: GenderFilterProps) => {
  return (
    <div className="w-full flex justify-center px-4">
      <Select value={selectedGender} onValueChange={onGenderChange}>
        <SelectTrigger 
          className="w-64 bg-black border-m1ssion-deep-blue h-12 rounded-md text-white"
        >
          <SelectValue placeholder="Filtra per categoria" />
        </SelectTrigger>
        <SelectContent
          className="w-64 bg-black border border-m1ssion-deep-blue z-50 text-white"
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
