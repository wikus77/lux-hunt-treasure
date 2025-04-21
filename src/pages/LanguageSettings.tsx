import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const languages = [
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "pt", name: "Português", flag: "🇵🇹" },
];

const LanguageSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState("it");

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    
    const selectedLang = languages.find(lang => lang.code === value);
    if (selectedLang) {
      toast({
        title: "Lingua Aggiornata",
        description: `La lingua dell'app è stata cambiata in ${selectedLang.name}.`
      });
    }
  };

  const handleSave = () => {
    navigate("/settings");
  };

  return (
    <div className="min-h-screen bg-black pb-6 w-full">
      <header className="fixed top-0 left-0 right-0 z-40 w-full px-4 py-6 flex items-center border-b border-projectx-deep-blue glass-backdrop transition-colors duration-300">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Impostazioni Lingua</h1>
      </header>
      <div className="h-[72px] w-full" />
      <div className="p-4">
        <div className="glass-card mb-6">
          <h2 className="text-lg font-semibold mb-4">Seleziona Lingua</h2>
          <RadioGroup value={selectedLanguage} onValueChange={handleLanguageChange} className="space-y-2">
            {languages.map((language) => (
              <div key={language.code} className="flex items-center justify-between rounded-md p-4 hover:bg-projectx-deep-blue">
                <div className="flex items-center">
                  <RadioGroupItem value={language.code} id={`language-${language.code}`} className="mr-4" />
                  <Label htmlFor={`language-${language.code}`} className="flex items-center text-base">
                    <span className="mr-2 text-lg">{language.flag}</span>
                    {language.name}
                  </Label>
                </div>
                {selectedLanguage === language.code && <Check className="h-5 w-5 text-projectx-neon-blue" />}
              </div>
            ))}
          </RadioGroup>
          <Button 
            onClick={handleSave}
            className="w-full mt-6 bg-gradient-to-r from-projectx-blue to-projectx-pink"
          >
            Salva Impostazioni
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LanguageSettings;
