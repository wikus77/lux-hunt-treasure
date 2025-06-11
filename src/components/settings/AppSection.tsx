
import { Volume2, Languages } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import SoundSettings from "./SoundSettings";
import { useSound } from "@/contexts/SoundContext";
import { useState } from "react";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";

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
  const [isAppSectionOpen, setIsAppSectionOpen] = useState(false);

  const handleSoundToggle = (checked: boolean) => {
    setSoundEffects(checked);
    toggleSound(checked);
  };

  return (
    <div className="mb-6">
      <div className="glass-card p-4">
        <Collapsible open={isAppSectionOpen} onOpenChange={setIsAppSectionOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-0">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Volume2 className="h-5 w-5 mr-3 text-projectx-neon-blue" />
              App
            </h2>
            <ChevronRight 
              className={`h-4 w-4 transition-transform ${isAppSectionOpen ? 'rotate-90' : ''}`} 
            />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4">
            <div className="space-y-4 text-white">
              <div className="flex justify-between items-center border-b border-white/10 pb-2">
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

              <div className="border border-white/10 rounded-lg p-3 bg-black/20">
                <SoundSettings
                  volume={volume}
                  buzzSound={soundPreference}
                  onVolumeChange={updateVolume}
                  onSoundChange={updateSound}
                />
              </div>

              <div 
                className="flex justify-between items-center border-b border-white/10 pb-2 cursor-pointer hover:bg-white/5 p-2 rounded-lg"
                onClick={() => navigate('/language-settings')}
              >
                <div className="flex items-center">
                  <Languages className="h-5 w-5 mr-3 text-projectx-neon-blue" />
                  <span>Lingua</span>
                </div>
                <span className="text-gray-400">{language}</span>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default AppSection;
