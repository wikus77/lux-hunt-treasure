
import { Moon, Volume2, Languages } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import SoundSettings from "./SoundSettings";
import { useEffect } from "react";

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

  const handleThemeChange = (value: boolean) => {
    setDarkMode(value);
    localStorage.setItem('theme', value ? 'dark' : 'light');
    if (value) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <section className={`p-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
      <h2 className="text-xl font-bold mb-4">App</h2>
      
      <div className="space-y-2">
        <div className={`glass-card flex justify-between items-center p-4 ${
          darkMode 
            ? 'bg-black/10 border-white/10' 
            : 'bg-white shadow-lg border-gray-100'
        }`}>
          <div className="flex items-center">
            <Moon className={`h-5 w-5 mr-3 ${
              darkMode ? 'text-projectx-neon-blue' : 'text-blue-600'
            }`} />
            <span>
              {darkMode ? 'Passa alla Modalità Chiara' : 'Passa alla Modalità Scura'}
            </span>
          </div>
          <Switch 
            checked={darkMode} 
            onCheckedChange={handleThemeChange}
            className={darkMode ? 'bg-projectx-neon-blue' : 'bg-blue-500'}
          />
        </div>

        <div className={`glass-card flex justify-between items-center p-4 ${
          darkMode 
            ? 'bg-black/10 border-white/10' 
            : 'bg-white shadow-lg border-gray-100'
        }`}>
          <div className="flex items-center">
            <Volume2 className={`h-5 w-5 mr-3 ${
              darkMode ? 'text-projectx-neon-blue' : 'text-blue-600'
            }`} />
            <span>Effetti Sonori</span>
          </div>
          <Switch 
            checked={soundEffects} 
            onCheckedChange={setSoundEffects}
            className={darkMode ? 'bg-projectx-neon-blue' : 'bg-blue-500'}
          />
        </div>

        <SoundSettings
          volume={volume}
          buzzSound={buzzSound}
          onVolumeChange={onVolumeChange}
          onSoundChange={onSoundChange}
        />

        <div className={`glass-card flex justify-between items-center p-4 cursor-pointer ${
          darkMode 
            ? 'bg-black/10 border-white/10' 
            : 'bg-white shadow-lg border-gray-100'
        }`} onClick={() => navigate('/language-settings')}>
          <div className="flex items-center">
            <Languages className={`h-5 w-5 mr-3 ${
              darkMode ? 'text-projectx-neon-blue' : 'text-blue-600'
            }`} />
            <span>Lingua</span>
          </div>
          <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>{language}</span>
        </div>
      </div>
    </section>
  );
};

export default AppSection;
