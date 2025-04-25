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
import { AnimatePresence } from "framer-motion";
import HomeIntro from './HomeIntro';
import EventCarousel from './EventCarousel';
import FutureMissionsCarousel from './FutureMissionsCarousel';
import InviteFriendSection from './InviteFriendSection';

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

  const [showIntro, setShowIntro] = useState(true);

  return (
    <div className="space-y-8">
      <AnimatePresence>
        {showIntro && (
          <HomeIntro onEnd={() => setShowIntro(false)} />
        )}
      </AnimatePresence>
      {!showIntro && (
        <>
          <EventCarousel />
          <FutureMissionsCarousel />
          <InviteFriendSection />
        </>
      )}
    </div>
  );
}
