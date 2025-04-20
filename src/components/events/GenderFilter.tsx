
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GenderFilterProps {
  selectedGender: string;
  onGenderChange: (value: string) => void;
}

const GenderFilter = ({ selectedGender, onGenderChange }: GenderFilterProps) => {
  return (
    <div className="p-4">
      <Select value={selectedGender} onValueChange={onGenderChange}>
        <SelectTrigger className="w-full md:w-[200px] bg-black border-m1ssion-deep-blue">
          <SelectValue placeholder="Filtra per categoria" />
        </SelectTrigger>
        <SelectContent className="bg-black border border-m1ssion-deep-blue">
          <SelectItem value="all">Tutti gli eventi</SelectItem>
          <SelectItem value="man">Player Man</SelectItem>
          <SelectItem value="woman">Player Woman</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default GenderFilter;

