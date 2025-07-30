// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React from "react";
import CinematicLandingPage from "@/components/cinematic/CinematicLandingPage";

const CinematicHomePage: React.FC = () => {
  console.log("🎬 CINEMATIC HOME PAGE COMPONENT MOUNTED - M1SSION™ Experience");
  console.log("🎬 Route '/' should show CINEMATIC PAGE, not standard landing");
  
  return <CinematicLandingPage />;
};

export default CinematicHomePage;