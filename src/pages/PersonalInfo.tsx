import { useState, useEffect } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const PersonalInfo = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [originalInfo, setOriginalInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    investigativeStyle: "",
    preferredLanguage: ""
  });
  
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    investigativeStyle: "",
    preferredLanguage: ""
  });

  const investigativeStyles = [
    { value: "strategico", label: "Strategico" },
    { value: "impulsivo", label: "Impulsivo" },
    { value: "logico", label: "Logico" },
    { value: "misterioso", label: "Misterioso" },
    { value: "analitico", label: "Analitico" },
    { value: "intuitivo", label: "Intuitivo" }
  ];

  const languages = [
    { value: "italiano", label: "Italiano" },
    { value: "english", label: "English" },
    { value: "français", label: "Français" },
    { value: "español", label: "Español" },
    { value: "deutsch", label: "Deutsch" }
  ];

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    // Load user data from Supabase
    const loadUserData = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast.error("Sessione non valida. Effettua il login.");
          navigate("/login");
          return;
        }
        
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, email, phone, address, city, postal_code, country, investigative_style, preferred_language')
          .eq('id', session.user.id)
          .single();
          
        if (error) {
          console.error("Errore nel caricamento dei dati:", error);
          toast.error("Impossibile caricare i dati personali");
          return;
        }
        
        if (data) {
          const userData = {
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            city: data.city || "",
            postalCode: data.postal_code || "",
            country: data.country || "",
            investigativeStyle: data.investigative_style || "",
            preferredLanguage: data.preferred_language || "italiano"
          };
          
          setPersonalInfo(userData);
          setOriginalInfo(userData);
        }
      } catch (error) {
        console.error("Errore:", error);
        toast.error("Si è verificato un errore nel caricamento dei dati");
      }
    };
    
    loadUserData();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => {
      const newState = { ...prev, [name]: value };
      setIsDirty(JSON.stringify(newState) !== JSON.stringify(originalInfo));
      return newState;
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setPersonalInfo(prev => {
      const newState = { ...prev, [name]: value };
      setIsDirty(JSON.stringify(newState) !== JSON.stringify(originalInfo));
      return newState;
    });
  };

  const validateEmail = (email: string): boolean => {
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    if (personalInfo.email && !validateEmail(personalInfo.email)) {
      toast.error("Inserisci un indirizzo email valido");
      return;
    }
    
    setLoading(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Sessione non valida. Effettua il login.");
        navigate("/login");
        return;
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: personalInfo.firstName,
          last_name: personalInfo.lastName,
          email: personalInfo.email,
          phone: personalInfo.phone,
          address: personalInfo.address,
          city: personalInfo.city,
          postal_code: personalInfo.postalCode,
          country: personalInfo.country,
          investigative_style: personalInfo.investigativeStyle,
          preferred_language: personalInfo.preferredLanguage,
          full_name: `${personalInfo.firstName} ${personalInfo.lastName}`.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', session.user.id);
        
      if (error) {
        console.error("Errore nell'aggiornamento dei dati:", error);
        toast.error("Impossibile aggiornare i dati personali");
        return;
      }
      
      toast.success("✅ Profilo aggiornato con successo", {
        description: "Le tue informazioni personali sono state aggiornate correttamente."
      });
      
      // Update original info to match current info
      setOriginalInfo({...personalInfo});
      setIsDirty(false);
      
    } catch (error) {
      console.error("Errore:", error);
      toast.error("Si è verificato un errore durante il salvataggio");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black pb-6">
      <header className="px-4 py-6 flex items-center border-b border-projectx-deep-blue">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2 rounded-lg"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-white">Modifica Informazioni Personali</h1>
      </header>

      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="glass-card mb-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 text-white">Dati Personali</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-1 text-white">
                  Nome
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={personalInfo.firstName}
                  onChange={handleInputChange}
                  className="rounded-lg bg-black/50 border-white/10"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium mb-1 text-white">
                  Cognome
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={personalInfo.lastName}
                  onChange={handleInputChange}
                  className="rounded-lg bg-black/50 border-white/10"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1 text-white">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={personalInfo.email}
                  onChange={handleInputChange}
                  className="rounded-lg bg-black/50 border-white/10"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1 text-white">
                  Telefono
                </label>
                <Input
                  id="phone"
                  name="phone"
                  value={personalInfo.phone}
                  onChange={handleInputChange}
                  className="rounded-lg bg-black/50 border-white/10"
                />
              </div>

              <div>
                <label htmlFor="investigativeStyle" className="block text-sm font-medium mb-1 text-white">
                  Stile Investigativo
                </label>
                <Select 
                  value={personalInfo.investigativeStyle} 
                  onValueChange={(value) => handleSelectChange('investigativeStyle', value)}
                >
                  <SelectTrigger className="rounded-lg bg-black/50 border-white/10">
                    <SelectValue placeholder="Seleziona il tuo stile" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-white/10 rounded-lg">
                    {investigativeStyles.map((style) => (
                      <SelectItem 
                        key={style.value} 
                        value={style.value}
                        className="text-white hover:bg-white/10"
                      >
                        {style.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="preferredLanguage" className="block text-sm font-medium mb-1 text-white">
                  Lingua Preferita
                </label>
                <Select 
                  value={personalInfo.preferredLanguage} 
                  onValueChange={(value) => handleSelectChange('preferredLanguage', value)}
                >
                  <SelectTrigger className="rounded-lg bg-black/50 border-white/10">
                    <SelectValue placeholder="Seleziona la lingua" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-white/10 rounded-lg">
                    {languages.map((language) => (
                      <SelectItem 
                        key={language.value} 
                        value={language.value}
                        className="text-white hover:bg-white/10"
                      >
                        {language.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="glass-card mb-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4 text-white">Indirizzo</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="address" className="block text-sm font-medium mb-1 text-white">
                  Via e Numero
                </label>
                <Input
                  id="address"
                  name="address"
                  value={personalInfo.address}
                  onChange={handleInputChange}
                  className="rounded-lg bg-black/50 border-white/10"
                />
              </div>
              
              <div>
                <label htmlFor="city" className="block text-sm font-medium mb-1 text-white">
                  Città
                </label>
                <Input
                  id="city"
                  name="city"
                  value={personalInfo.city}
                  onChange={handleInputChange}
                  className="rounded-lg bg-black/50 border-white/10"
                />
              </div>
              
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium mb-1 text-white">
                  CAP
                </label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  value={personalInfo.postalCode}
                  onChange={handleInputChange}
                  className="rounded-lg bg-black/50 border-white/10"
                />
              </div>
              
              <div>
                <label htmlFor="country" className="block text-sm font-medium mb-1 text-white">
                  Paese
                </label>
                <Input
                  id="country"
                  name="country"
                  value={personalInfo.country}
                  onChange={handleInputChange}
                  className="rounded-lg bg-black/50 border-white/10"
                />
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex-1 rounded-lg"
            >
              ↩️ Annulla
            </Button>
            <Button 
              type="submit"
              disabled={!isDirty || loading}
              className="flex-1 bg-white text-black hover:bg-gray-100 rounded-lg"
            >
              <Save className="mr-2 h-4 w-4" /> 
              {loading ? "Salvataggio..." : "💾 Salva modifiche"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PersonalInfo;
