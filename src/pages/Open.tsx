
import React, { useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';

const Open: React.FC = () => {
  useEffect(() => {
    // Tentativo automatico di aprire l'app Capacitor dopo 1 secondo
    const timer = setTimeout(() => {
      window.location.href = 'capacitor://localhost/home';
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const handleManualOpen = () => {
    window.location.href = 'capacitor://localhost/home';
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="space-y-4">
          <Spinner size="lg" className="text-[#00D1FF] mx-auto" />
          <h1 className="text-2xl font-bold text-white">
            Apertura in corso...
          </h1>
          <p className="text-gray-400">
            Stiamo aprendo l'app M1SSION per te
          </p>
        </div>

        <div className="space-y-4 pt-8">
          <p className="text-sm text-gray-500">
            L'app non si è aperta automaticamente?
          </p>
          <button
            onClick={handleManualOpen}
            className="w-full bg-gradient-to-r from-[#00D1FF] to-[#00BFFF] text-black font-bold py-3 px-6 rounded-lg hover:shadow-[0_0_15px_rgba(0,209,255,0.5)] transition-all duration-300"
          >
            Apri M1SSION manualmente
          </button>
        </div>

        <div className="pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-600">
            Assicurati di avere l'app M1SSION installata sul tuo dispositivo
          </p>
        </div>
      </div>
    </div>
  );
};

export default Open;
