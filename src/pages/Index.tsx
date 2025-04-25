
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import HomeContent from "@/components/home/HomeContent";
import { motion } from "framer-motion";
import IntroAnimation from "@/components/intro/IntroAnimation";

const Index = () => {
  const [showIntro, setShowIntro] = useState(true);
  const [introCompleted, setIntroCompleted] = useState(false);

  useEffect(() => {
    // Uncomment this line to test the intro animation again
    // localStorage.removeItem('introShown');
    const introShown = localStorage.getItem('introShown');
    if (introShown) {
      setShowIntro(false);
      setIntroCompleted(true);
    } else {
      setShowIntro(true);
      localStorage.setItem('introShown', 'true');
    }
  }, []);

  const handleIntroComplete = () => {
    setIntroCompleted(true);
    setShowIntro(false);
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-black overflow-x-hidden">
      <AnimatePresence>
        {showIntro && (
          <IntroAnimation onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>
      {introCompleted && (
        <>
          <UnifiedHeader />
          <div className="h-[72px] w-full" />
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full mx-auto max-w-4xl"
          >
            <HomeContent />
          </motion.div>
        </>
      )}
    </div>
  );
};

export default Index;
