// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import M1ssionRevealAnimation from '@/components/intro/M1ssionRevealAnimation';

const PostLoginMissionIntro: React.FC = () => {
  const [, navigate] = useLocation();

  useEffect(() => {
    console.log("✅ Phase 4 passed successfully - Post-login M1SSION animation started");
  }, []);

  const handleAnimationComplete = () => {
    console.log("✅ Phase 5 passed successfully - M1SSION animation completed, redirecting to /home");
    // Mark that the user has seen the post-login intro
    sessionStorage.setItem("hasSeenPostLoginIntro", "true");
    // Navigate to home
    navigate('/home');
  };

  return <M1ssionRevealAnimation onComplete={handleAnimationComplete} />;
};

export default PostLoginMissionIntro;