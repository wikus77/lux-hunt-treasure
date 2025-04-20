
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface SoundSettingsProps {
  volume: number[];
  buzzSound: string;
  onVolumeChange: (value: number[]) => void;
  onSoundChange: (value: string) => void;
}

const SoundSettings = ({
  volume,
  buzzSound,
  onVolumeChange,
  onSoundChange
}: SoundSettingsProps) => {
  const playSound = (soundPath: string) => {
    const audio = new Audio(soundPath);
    audio.volume = volume[0] / 100;
    audio.play().catch(e => console.error("Error playing sound:", e));
  };

  const getSoundPath = (sound: string) => {
    switch (sound) {
      case 'chime':
        return "/sounds/chime.mp3";
      case 'bell':
        return "/sounds/bell.mp3";
      case 'arcade':
        return "/sounds/arcade.mp3";
      default:
        return "/sounds/buzz.mp3";
    }
  };

  return (
    <>
      <div className="glass-card p-4">
        <div className="flex items-center mb-3">
          <Volume2 className="h-5 w-5 mr-3 text-projectx-neon-blue" />
          <span>Volume</span>
        </div>
        <Slider
          value={volume}
          onValueChange={onVolumeChange}
          max={100}
          step={1}
        />
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center mb-3">
          <Volume2 className="h-5 w-5 mr-3 text-projectx-neon-blue" />
          <span>Suono Buzz</span>
        </div>
        
        <RadioGroup value={buzzSound} onValueChange={onSoundChange}>
          <div className="flex items-center space-x-2 mb-2">
            <RadioGroupItem value="default" id="sound-default" />
            <Label htmlFor="sound-default">Default</Label>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto"
              onClick={() => playSound('/sounds/buzz.mp3')}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2 mb-2">
            <RadioGroupItem value="chime" id="sound-chime" />
            <Label htmlFor="sound-chime">Chime</Label>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto"
              onClick={() => playSound('/sounds/chime.mp3')}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2 mb-2">
            <RadioGroupItem value="bell" id="sound-bell" />
            <Label htmlFor="sound-bell">Bell</Label>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto"
              onClick={() => playSound('/sounds/bell.mp3')}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="arcade" id="sound-arcade" />
            <Label htmlFor="sound-arcade">Arcade</Label>
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto"
              onClick={() => playSound('/sounds/arcade.mp3')}
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
        </RadioGroup>
      </div>
    </>
  );
};

export default SoundSettings;
