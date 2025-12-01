import { useState, useEffect } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { setLocale, getLocale } from "@/i18n/i18n";
import { useTranslation } from "react-i18next";

// 🌍 Solo lingue con traduzioni complete
const languages = [
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
] as const;

type SupportedLang = typeof languages[number]['code'];

const LanguageSettings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLang>(() => {
    const current = getLocale();
    return (current as SupportedLang) || "it";
  });

  // Sincronizza con i18n all'avvio
  useEffect(() => {
    const current = getLocale();
    if (current && languages.some(l => l.code === current)) {
      setSelectedLanguage(current as SupportedLang);
    }
  }, []);

  const handleLanguageChange = (value: string) => {
    const lang = value as SupportedLang;
    setSelectedLanguage(lang);
    
    // 🔧 Applica il cambio lingua con i18next
    setLocale(lang);
    
    const selectedLang = languages.find(l => l.code === lang);
    if (selectedLang) {
      toast({
        title: lang === 'it' ? "Lingua Aggiornata" : lang === 'fr' ? "Langue Mise à Jour" : "Language Updated",
        description: lang === 'it' 
          ? `La lingua dell'app è stata cambiata in ${selectedLang.name}.`
          : lang === 'fr'
          ? `La langue de l'app a été changée en ${selectedLang.name}.`
          : `App language has been changed to ${selectedLang.name}.`
      });
    }
  };

  const handleSave = () => {
    navigate("/settings");
  };

  // Testi localizzati
  const texts = {
    it: { title: "Impostazioni Lingua", select: "Seleziona Lingua", save: "Salva Impostazioni" },
    en: { title: "Language Settings", select: "Select Language", save: "Save Settings" },
    fr: { title: "Paramètres de Langue", select: "Sélectionner la Langue", save: "Enregistrer" },
  };
  const currentTexts = texts[selectedLanguage] || texts.en;

  return (
    <div className="min-h-screen bg-black pb-6 w-full">
      <header className="fixed top-0 left-0 right-0 z-40 w-full px-4 py-6 flex items-center border-b border-gray-700 glass-backdrop transition-colors duration-300">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">{currentTexts.title}</h1>
      </header>
      <div className="h-[72px] w-full" />
      <div className="p-4">
        <div className="glass-card mb-6">
          <h2 className="text-lg font-semibold mb-4">{currentTexts.select}</h2>
          <RadioGroup value={selectedLanguage} onValueChange={handleLanguageChange} className="space-y-2">
            {languages.map((language) => (
              <div key={language.code} className="flex items-center justify-between rounded-md p-4 hover:bg-gray-800">
                <div className="flex items-center">
                  <RadioGroupItem value={language.code} id={`language-${language.code}`} className="mr-4" />
                  <Label htmlFor={`language-${language.code}`} className="flex items-center text-base">
                    <span className="mr-2 text-lg">{language.flag}</span>
                    {language.name}
                  </Label>
                </div>
                {selectedLanguage === language.code && <Check className="h-5 w-5 text-m1ssion-blue" />}
              </div>
            ))}
          </RadioGroup>
          <Button 
            onClick={handleSave}
            className="w-full mt-6 bg-gradient-to-r from-m1ssion-blue to-m1ssion-pink"
          >
            {currentTexts.save}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LanguageSettings;
