
import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const PersonalInfo = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [personalInfo, setPersonalInfo] = useState({
    firstName: "Mario",
    lastName: "Rossi",
    email: "mario.rossi@example.com",
    phone: "+39 123 456 7890",
    address: "Via Roma 123",
    city: "Milano",
    postalCode: "20100",
    country: "Italia"
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPersonalInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Informazioni Aggiornate",
      description: "Le tue informazioni personali sono state aggiornate con successo."
    });
    navigate("/settings");
  };

  return (
    <div className="min-h-screen bg-black pb-6">
      <header className="px-4 py-6 flex items-center border-b border-projectx-deep-blue">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Informazioni Personali</h1>
      </header>

      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="glass-card mb-4">
            <h2 className="text-lg font-semibold mb-4">Dati Personali</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                  Nome
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={personalInfo.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                  Cognome
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={personalInfo.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={personalInfo.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-1">
                  Telefono
                </label>
                <Input
                  id="phone"
                  name="phone"
                  value={personalInfo.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          
          <div className="glass-card mb-4">
            <h2 className="text-lg font-semibold mb-4">Indirizzo</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="address" className="block text-sm font-medium mb-1">
                  Via e Numero
                </label>
                <Input
                  id="address"
                  name="address"
                  value={personalInfo.address}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label htmlFor="city" className="block text-sm font-medium mb-1">
                  Città
                </label>
                <Input
                  id="city"
                  name="city"
                  value={personalInfo.city}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium mb-1">
                  CAP
                </label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  value={personalInfo.postalCode}
                  onChange={handleInputChange}
                />
              </div>
              
              <div>
                <label htmlFor="country" className="block text-sm font-medium mb-1">
                  Paese
                </label>
                <Input
                  id="country"
                  name="country"
                  value={personalInfo.country}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          
          <Button 
            type="submit"
            className="w-full bg-gradient-to-r from-projectx-blue to-projectx-pink"
          >
            <Save className="mr-2 h-4 w-4" /> Salva Modifiche
          </Button>
        </form>
      </div>
    </div>
  );
};

export default PersonalInfo;
