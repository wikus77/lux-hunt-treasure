
import { useState } from 'react';
import BriefProfileModal from "@/components/profile/BriefProfileModal";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import CurrentEventSection from './CurrentEventSection';
import MysteryPrizesSection from './MysteryPrizesSection';
import CluesSection from './CluesSection';
import { SocialShareButtons } from "@/components/social/SocialShareButtons";
import { AIAssistant } from '@/components/ai/AIAssistant';
import { motion } from "framer-motion";
import { User, Settings, Trophy, Share2 } from "lucide-react";

export default function HomeContent() {
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Current Event Section */}
      <motion.div variants={itemVariants}>
        <CurrentEventSection />
      </motion.div>
      
      {/* Mystery Prizes Section */}
      <motion.div variants={itemVariants}>
        <MysteryPrizesSection />
      </motion.div>
      
      {/* Clues Section */}
      <motion.div variants={itemVariants}>
        <CluesSection />
      </motion.div>

      {/* Profile Section */}
      <motion.section variants={itemVariants} className="glass-card p-6">
        <h2 className="gradient-text-cyan text-2xl font-bold mb-4 font-orbitron">Esplora il Tuo Profilo</h2>
        
        <div className="relative">
          {/* Background light effect */}
          <div className="absolute -top-10 -right-10 w-60 h-60 bg-cyan-400/10 blur-[100px] rounded-full pointer-events-none"></div>
          
          <p className="text-white/70 mb-6">
            Visualizza e modifica le tue informazioni personali, accedi alle tue statistiche e condividi la tua esperienza.
          </p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button 
              onClick={() => setIsProfileModalOpen(true)}
              className="flex items-center gap-2"
              variant="outline"
            >
              <User className="h-5 w-5" />
              Visualizza Profilo
            </Button>
            
            <Button 
              onClick={() => navigate('/stats')}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Trophy className="h-5 w-5" />
              Statistiche
            </Button>
            
            <Button 
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2"
              variant="outline"
            >
              <Settings className="h-5 w-5" />
              Impostazioni
            </Button>
            
            <div className="flex items-center justify-center h-10 gap-2">
              <SocialShareButtons />
            </div>
          </div>
        </div>
      </motion.section>
      
      {/* Motivational section with logo */}
      <motion.section 
        variants={itemVariants} 
        className="glass-card p-6 text-center relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="line-glow mb-6"></div>
          <h3 className="mission-motto mb-2">IT IS POSSIBLE</h3>
          <p className="text-white/70 mb-6">Partecipa alla sfida, risolvi gli enigmi e vinci davvero</p>
          <Button 
            onClick={() => navigate('/events')}
            variant="default"
            className="mx-auto"
          >
            Inizia l'Avventura
          </Button>
          <div className="line-glow mt-6"></div>
        </div>
        
        {/* Background decorative elements */}
        <motion.div 
          className="absolute top-1/2 right-0 transform -translate-y-1/2 -translate-x-5 opacity-5 w-40 h-40"
          animate={{ 
            rotate: 360,
          }}
          transition={{ 
            duration: 60, 
            ease: "linear", 
            repeat: Infinity,
          }}
        >
          <img 
            src="/lovable-uploads/ed5de774-31bd-4930-8b16-7af05790ab50.png" 
            alt="M1SSION Logo" 
            className="w-full h-full"
          />
        </motion.div>
      </motion.section>

      {/* AI Assistant (always visible on all pages) */}
      <AIAssistant />
      
      <BriefProfileModal open={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </motion.div>
  );
}
