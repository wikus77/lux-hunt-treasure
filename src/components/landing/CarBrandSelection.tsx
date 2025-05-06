
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Car brand data
const carBrands = [
  { 
    id: "ferrari", 
    name: "Ferrari", 
    models: ["488 GTB", "SF90 Stradale", "Roma", "F8 Tributo"],
    specs: "Motore V8 biturbo da 3.9 litri, 720 CV, 0-100 km/h in 2.9s" 
  },
  { 
    id: "lamborghini", 
    name: "Lamborghini", 
    models: ["Huracán", "Aventador", "Urus", "Revuelto"],
    specs: "Motore V10 da 5.2 litri, 640 CV, 0-100 km/h in 2.9s" 
  },
  { 
    id: "porsche", 
    name: "Porsche", 
    models: ["911 Carrera", "Taycan", "Cayenne", "Panamera"],
    specs: "Motore boxer 6 cilindri biturbo da 3.0 litri, 450 CV, 0-100 km/h in 3.4s" 
  },
  { 
    id: "bentley", 
    name: "Bentley", 
    models: ["Continental GT", "Bentayga", "Flying Spur"],
    specs: "Motore W12 biturbo da 6.0 litri, 635 CV, 0-100 km/h in 3.6s" 
  },
  { 
    id: "rolls-royce", 
    name: "Rolls-Royce", 
    models: ["Ghost", "Phantom", "Cullinan", "Spectre"],
    specs: "Motore V12 biturbo da 6.75 litri, 563 CV, 0-100 km/h in 4.8s" 
  }
];

const CarBrandSelection = () => {
  const [selectedBrand, setSelectedBrand] = useState("ferrari");
  
  const currentBrand = carBrands.find(brand => brand.id === selectedBrand);
  
  return (
    <div className="p-6 bg-black/40 backdrop-blur-sm rounded-lg border border-cyan-500/20">
      <Tabs defaultValue="ferrari" className="w-full" onValueChange={setSelectedBrand}>
        <TabsList className="grid grid-cols-3 md:grid-cols-5 bg-black/60">
          {carBrands.map(brand => (
            <TabsTrigger 
              key={brand.id}
              value={brand.id}
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-white"
            >
              {brand.name}
            </TabsTrigger>
          ))}
        </TabsList>
        
        {carBrands.map(brand => (
          <TabsContent key={brand.id} value={brand.id} className="mt-4">
            <motion.div
              key={brand.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-white"
            >
              <h3 className="text-xl font-semibold text-cyan-400 mb-2">{brand.name}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium mb-2">Modelli</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {brand.models.map((model, index) => (
                      <li key={index}>{model}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="text-lg font-medium mb-2">Specifiche tecniche</h4>
                  <p>{brand.specs}</p>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default CarBrandSelection;
