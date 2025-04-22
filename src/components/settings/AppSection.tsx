
import { Volume2, Languages } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import SoundSettings from "./SoundSettings";

interface AppSectionProps {
  soundEffects: boolean;
  language: string;
  volume: number[];
  buzzSound: string;
  setSoundEffects: (value: boolean) => void;
  onVolumeChange: (value: number[]) => void;
  onSoundChange: (value: string) => void;
}

const AppSection = ({
  soundEffects,
  language,
  volume,
  buzzSound,
  setSoundEffects,
  onVolumeChange,
  onSoundChange
}: AppSectionProps) => {
  const navigate = useNavigate();

  return (
    <section className="p-4">
      <h2 className="text-xl font-bold mb-4">App</h2>
      
      <div className="space-y-2">
        <div className="glass-card flex justify-between items-center p-4">
          <div className="flex items-center">
            <Volume2 className="h-5 w-5 mr-3 text-projectx-neon-blue" />
            <span>Effetti Sonori</span>
          </div>
          <Switch 
            checked={soundEffects} 
            onCheckedChange={setSoundEffects}
            className="bg-projectx-neon-blue"
          />
        </div>

        <SoundSettings
          volume={volume}
          buzzSound={buzzSound}
          onVolumeChange={(newVolume) => {
            onVolumeChange(newVolume);
            localStorage.setItem('buzzVolume', newVolume[0].toString());
          }}
          onSoundChange={(newSound) => {
            onSoundChange(newSound);
            localStorage.setItem('buzzSound', newSound);
          }}
        />

        <div className="glass-card flex justify-between items-center p-4 cursor-pointer" 
          onClick={() => navigate('/language-settings')}>
          <div className="flex items-center">
            <Languages className="h-5 w-5 mr-3 text-projectx-neon-blue" />
            <span>Lingua</span>
          </div>
          <span className="text-gray-400">{language}</span>
        </div>
      </div>
    </section>
  );
};

export default AppSection;
