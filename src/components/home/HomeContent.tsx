
import CurrentEventSection from "@/components/home/CurrentEventSection";
import MysteryPrizesSection from "@/components/home/MysteryPrizesSection";
import CluesSection from "@/components/home/CluesSection";
import { useState, useEffect } from "react";

const HomeContent = () => {
  const [error, setError] = useState<string | null>(null);
  
  // Simple error boundary
  if (error) {
    return <div className="p-4 bg-red-800/30 rounded-md">
      <p>Si è verificato un errore nel caricamento del contenuto.</p>
      <button 
        onClick={() => setError(null)}
        className="mt-2 px-4 py-2 bg-red-900 rounded-md">
        Riprova
      </button>
    </div>;
  }
  
  return (
    <div className="space-y-8">
      <CurrentEventSection />
      
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="w-full sm:w-2/3">
          <CluesSection />
        </div>
        <div className="w-full sm:w-1/3">
          <MysteryPrizesSection />
        </div>
      </div>
    </div>
  );
};

export default HomeContent;
