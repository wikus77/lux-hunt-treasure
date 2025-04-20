
import { Moon, Volume2, Languages, ChevronRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import SoundSettings from "./SoundSettings";

interface AppSectionProps {
  darkMode: boolean;
  soundEffects: boolean;
  language: string;
  volume: number[];
  buzzSound: string;
  setDarkMode: (value: boolean) => void;
  setSoundEffects: (value: boolean) => void;
  onVolumeChange: (value: number[]) => void;
  onSoundChange: (value: string) => void;
}

const AppSection = ({
  darkMode,
  soundEffects,
  language,
  volume,
  buzzSound,
  setDarkMode,
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
            <Moon className="h-5 w-5 mr-3 text-projectx-neon-blue" />
            <span>Modalità Scura</span>
          </div>
          <Switch 
            checked={darkMode} 
            onCheckedChange={setDarkMode} 
          />
        </div>

        <div className="glass-card flex justify-between items-center p-4">
          <div className="flex items-center">
            <Volume2 className="h-5 w-5 mr-3 text-projectx-neon-blue" />
            <span>Effetti Sonori</span>
          </div>
          <Switch 
            checked={soundEffects} 
            onCheckedChange={setSoundEffects} 
          />
        </div>

        <SoundSettings
          volume={volume}
          buzzSound={buzzSound}
          onVolumeChange={onVolumeChange}
          onSoundChange={onSoundChange}
        />

        <div 
          className="glass-card flex justify-between items-center p-4 cursor-pointer"
          onClick={() => navigate('/language-settings')}
        >
          <div className="flex items-center">
            <Languages className="h-5 w-5 mr-3 text-projectx-neon-blue" />
            <span>Lingua</span>
          </div>
          <span className="text-muted-foreground">{language}</span>
        </div>
      </div>
    </section>
  );
};

export default AppSection;
