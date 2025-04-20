
import { Moon, Sun, Volume2, Languages } from "lucide-react";
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

  const handleThemeChange = (value: boolean) => {
    setDarkMode(value);
    localStorage.setItem('theme', value ? 'dark' : 'light');
    if (value) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <section className="p-4">
      <h2 className="text-xl font-bold mb-4">App</h2>
      
      <div className="space-y-2">
        <div className="glass-card flex justify-between items-center p-4">
          <div className="flex items-center">
            {darkMode ? (
              <Sun className="h-5 w-5 mr-3 text-yellow-400" />
            ) : (
              <Moon className="h-5 w-5 mr-3 text-indigo-600" />
            )}
            <span>
              {darkMode ? 'Passa alla Modalità Chiara' : 'Passa alla Modalità Scura'}
            </span>
          </div>
          <Switch 
            checked={darkMode} 
            onCheckedChange={handleThemeChange}
            className={darkMode ? 'bg-projectx-neon-blue' : 'bg-indigo-600'}
          />
        </div>

        <div className="glass-card flex justify-between items-center p-4">
          <div className="flex items-center">
            <Volume2 className={`h-5 w-5 mr-3 ${
              darkMode ? 'text-projectx-neon-blue' : 'text-indigo-600'
            }`} />
            <span>Effetti Sonori</span>
          </div>
          <Switch 
            checked={soundEffects} 
            onCheckedChange={setSoundEffects}
            className={darkMode ? 'bg-projectx-neon-blue' : 'bg-indigo-600'}
          />
        </div>

        <SoundSettings
          volume={volume}
          buzzSound={buzzSound}
          onVolumeChange={onVolumeChange}
          onSoundChange={onSoundChange}
        />

        <div className="glass-card flex justify-between items-center p-4 cursor-pointer" 
          onClick={() => navigate('/language-settings')}>
          <div className="flex items-center">
            <Languages className={`h-5 w-5 mr-3 ${
              darkMode ? 'text-projectx-neon-blue' : 'text-indigo-600'
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
