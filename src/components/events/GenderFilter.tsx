
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GenderFilterProps {
  selectedGender: string;
  onGenderChange: (value: string) => void;
}

const GenderFilter = ({ selectedGender, onGenderChange }: GenderFilterProps) => {
  return (
    <div className="w-full px-0">
      <Select value={selectedGender} onValueChange={onGenderChange}>
        <SelectTrigger 
          className="w-full bg-black border-m1ssion-deep-blue h-12 rounded-none" 
          style={{ minWidth: '100%' }}
        >
          <SelectValue placeholder="Filtra per categoria" />
        </SelectTrigger>
        <SelectContent 
          className="bg-black border border-m1ssion-deep-blue w-full z-50" 
          position="popper" 
          style={{ minWidth: '100%' }}
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
