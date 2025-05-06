
import { Volume2, Languages } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import SoundSettings from "./SoundSettings";
import { useSound } from "@/contexts/SoundContext";

interface AppSectionProps {
  soundEffects: boolean;
  language: string;
  setSoundEffects: (value: boolean) => void;
}

const AppSection = ({
  soundEffects,
  language,
  setSoundEffects,
}: AppSectionProps) => {
  const navigate = useNavigate();
  const { volume, soundPreference, isEnabled, updateSound, updateVolume, toggleSound } = useSound();

  const handleSoundToggle = (checked: boolean) => {
    setSoundEffects(checked);
    toggleSound(checked);
  };

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
            onCheckedChange={handleSoundToggle}
            className="bg-projectx-neon-blue"
          />
        </div>

        <SoundSettings
          volume={volume}
          buzzSound={soundPreference}
          onVolumeChange={updateVolume}
          onSoundChange={updateSound}
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
