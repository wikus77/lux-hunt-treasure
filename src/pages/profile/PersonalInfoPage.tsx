// FILE CREATO — BY JOSEPH MULE
import React from 'react';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import M1ssionText from '@/components/logo/M1ssionText';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PersonalInfoPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#131524]/70 to-black text-white">
      <UnifiedHeader leftComponent={<M1ssionText />} />
      <div className="h-[72px] w-full" />
      
      <motion.main 
        className="pb-20 px-3 sm:px-6 max-w-screen-xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="glass-card mx-2 sm:mx-4 mt-2 sm:mt-4 mb-20">
          <div className="p-3 sm:p-6">
            {/* Header with back button */}
            <div className="flex items-center gap-4 mb-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/profile')}
                className="p-2 hover:bg-white/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold">Informazioni Personali</h1>
            </div>
            
            {/* Content placeholder */}
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚧</div>
              <p className="text-lg text-gray-300">
                Pagina in costruzione – BY JOSEPH MULE
              </p>
            </div>
          </div>
        </div>
      </motion.main>
    </div>
  );
};

export default PersonalInfoPage;