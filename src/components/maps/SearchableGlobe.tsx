
import React, { useState, useCallback, useEffect } from "react";
import { GoogleMap, useLoadScript } from "@react-google-maps/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
// Import Combobox di shadcn
import { Command, CommandInput, CommandList, CommandItem, CommandGroup } from "@/components/ui/command";

interface City {
  name: string;
  lat: number;
  lng: number;
  region?: string;
  province?: string;
}

// Province italiane (denominazione ufficiale)
const italianProvinces: string[] = [
  "Agrigento", "Alessandria", "Ancona", "Aosta", "Arezzo", "Ascoli Piceno", "Asti", "Avellino", "Bari",
  "Barletta-Andria-Trani", "Belluno", "Benevento", "Bergamo", "Biella", "Bologna", "Bolzano", "Brescia",
  "Brindisi", "Cagliari", "Caltanissetta", "Campobasso", "Caserta", "Catanzaro", "Chieti", "Como", "Cosenza",
  "Cremona", "Crotone", "Cuneo", "Enna", "Fermo", "Ferrara", "Firenze", "Foggia", "Forlì-Cesena", "Frosinone",
  "Genova", "Gorizia", "Grosseto", "Imperia", "Isernia", "L'Aquila", "La Spezia", "Latina", "Lecce", "Lecco",
  "Livorno", "Lodi", "Lucca", "Macerata", "Mantova", "Massa-Carrara", "Matera", "Medio Campidano", "Messina",
  "Milano", "Modena", "Monza e Brianza", "Napoli", "Novara", "Nuoro", "Ogliastra", "Olbia-Tempio", "Oristano",
  "Padova", "Palermo", "Parma", "Pavia", "Perugia", "Pesaro e Urbino", "Pescara", "Piacenza", "Pisa",
  "Pistoia", "Pordenone", "Potenza", "Prato", "Ragusa", "Ravenna", "Reggio Calabria", "Reggio Emilia",
  "Rieti", "Rimini", "Roma", "Rovigo", "Salerno", "Medio Campidano", "Sassari", "Savona", "Siena",
  "Siracusa", "Sondrio", "Taranto", "Teramo", "Terni", "Torino", "Trapani", "Trento", "Treviso",
  "Trieste", "Udine", "Varese", "Venezia", "Verbano-Cusio-Ossola", "Vercelli", "Verona", "Vibo Valentia",
  "Vicenza", "Viterbo"
];

// Città già presenti -- italianCities

// Unione province (senza duplicati rispetto alle città)
const allOptions: { label: string, value: string, type: "province" | "city", lat?: number, lng?: number }[] = [
  // Province
  ...italianProvinces.map(prov => ({
    label: prov,
    value: prov.toLowerCase(),
    type: "province"
  })),
  // Città (solo una per nome, senza duplicati delle province già inserite)
  ...italianCities
    .filter(city => !italianProvinces.some(p => p.toLowerCase() === city.name.toLowerCase()))
    .map(city => ({
      label: city.name,
      value: city.name.toLowerCase(),
      type: "city",
      lat: city.lat,
      lng: city.lng
    }))
];

const containerStyle = {
  width: "100%",
  height: "40vh",
  borderRadius: "1rem",
};

const defaultCenter = { lat: 41.9028, lng: 12.4964 };
const defaultZoom = 6;

const GOOGLE_MAPS_API_KEY = "AIzaSyDcPS0_nVl2-Waxcby_Vn3iu1ojh360oKQ";

const SearchableGlobe: React.FC = () => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ["places"],
  });
  
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const { toast } = useToast();
  const [searching, setSearching] = useState(false);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    console.log("Map loaded successfully");
  }, []);
  
  useEffect(() => {
    if (isLoaded && map) {
      try {
        markers.forEach(marker => marker.map = null);
        setMarkers([]);
        
        const newMarkers = italianCities.map(city => {
          const marker = new google.maps.marker.AdvancedMarkerElement({
            map,
            position: { lat: city.lat, lng: city.lng },
            title: city.name,
          });
          
          marker.addListener("click", () => {
            setSelectedCity(city);
            map.panTo({ lat: city.lat, lng: city.lng });
            map.setZoom(12);
          });
          
          return marker;
        });
        
        setMarkers(newMarkers);
      } catch (error) {
        console.error("Error creating markers:", error);
      }
    }
  }, [isLoaded, map]);

  const handleOptionSelect = (option: { label: string, value: string, type: string, lat?: number, lng?: number }) => {
    setSearch(option.label);
    setSearching(false);

    let cityFound: City | undefined;
    if (option.type === "city" && option.lat && option.lng) {
      cityFound = italianCities.find(city => city.name.toLowerCase() === option.value);
    } else if (option.type === "province") {
      // se la provincia ha una città capoluogo presente tra le città, centra quella
      cityFound = italianCities.find(city =>
        city.name.toLowerCase() === option.label.toLowerCase()
      );
    }

    if (cityFound && map) {
      setSelectedCity(cityFound);
      map.panTo({ lat: cityFound.lat, lng: cityFound.lng });
      map.setZoom(12);
      toast({
        title: `${cityFound.name}`,
        description: `Centrata la mappa su ${cityFound.name}`,
      });
    } else if (option.type === "province" && map) {
      toast({
        title: "Provincia senza città capoluogo nei dati",
        description: `Non è presente una città principale per la provincia selezionata.`,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Errore",
        description: `Non è stato possibile centrare la mappa.`,
        variant: "destructive",
      });
    }
  };

  // Lascia il form per compatibilità mobile/tastiera/minor fallback
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) {
      toast({
        title: "Campo vuoto",
        description: "Seleziona o scrivi il nome di una città o provincia",
        variant: "destructive",
      });
      return;
    }
    // Cerca la città tra le options (identica, case insensitive)
    const option = allOptions.find(
      opt => opt.label.toLowerCase() === search.trim().toLowerCase()
    );
    if (option) {
      handleOptionSelect(option);
    } else {
      toast({
        title: "Non trovato",
        description: `Nessuna città o provincia trovata per: ${search}`,
        variant: "destructive",
      });
    }
  };

  if (loadError) {
    return (
      <div className="text-center py-8 bg-red-500/10 rounded-lg border border-red-500/30 p-4">
        <p className="text-red-500">Errore nel caricamento della mappa: {loadError.message}</p>
        <p className="text-sm mt-2">Verifica che l'API Google Maps sia attivata nella console Google Cloud.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return <div className="text-center py-8">Caricamento mappa...</div>;
  }

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={selectedCity ? { lat: selectedCity.lat, lng: selectedCity.lng } : defaultCenter}
        zoom={selectedCity ? 12 : defaultZoom}
        onLoad={onLoad}
        options={{
          fullscreenControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          zoomControl: true,
        }}
      >
        {/* I marker sono gestiti tramite l'useEffect */}
      </GoogleMap>
      <form onSubmit={handleSubmit} className="flex gap-2 mt-2 items-center z-10">
        <div className="w-full relative">
          {/* Barra intelligente con ricerca */}
          <Command shouldFilter={true}>
            <CommandInput
              value={search}
              onValueChange={v => { setSearch(v); setSearching(true); }}
              placeholder="Cerca una città o provincia italiana..."
              className="bg-black/70 border-projectx-deep-blue py-2"
              onFocus={() => setSearching(true)}
              onBlur={() => setTimeout(() => setSearching(false), 200)} // chiudi la lista col click fuori
            />
            {(searching && !!search) && (
            <div className="absolute left-0 mt-1 w-full z-50 bg-background rounded-md border max-h-52 overflow-y-auto shadow-lg">
              <CommandList>
                <CommandGroup heading="Province">
                  {allOptions
                    .filter(opt => opt.type === "province" && opt.label.toLowerCase().includes(search.toLowerCase()))
                    .map(opt => (
                      <CommandItem
                        key={"pr_"+opt.value}
                        onSelect={() => handleOptionSelect(opt)}
                        className="cursor-pointer"
                      >
                        {opt.label}
                        <span className="ml-2 text-xs text-muted-foreground">Provincia</span>
                      </CommandItem>
                    ))}
                </CommandGroup>
                <CommandGroup heading="Città">
                  {allOptions
                    .filter(opt => opt.type === "city" && opt.label.toLowerCase().includes(search.toLowerCase()))
                    .map(opt => (
                      <CommandItem
                        key={"ct_"+opt.value}
                        onSelect={() => handleOptionSelect(opt)}
                        className="cursor-pointer"
                      >
                        {opt.label}
                        <span className="ml-2 text-xs text-muted-foreground">Città</span>
                      </CommandItem>
                    ))}
                </CommandGroup>
              </CommandList>
            </div>
            )}
          </Command>
        </div>
        <Button
          type="submit"
          variant="outline"
          className="bg-projectx-deep-blue hover:bg-projectx-blue"
        >
          Cerca
        </Button>
      </form>
    </div>
  );
};

export default SearchableGlobe;

