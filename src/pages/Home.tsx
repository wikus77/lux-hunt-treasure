
import { useState } from "react";
import { Menu, User, Mail } from "lucide-react";
import BottomNavigation from "@/components/layout/BottomNavigation";
import CurrentEventSection from "@/components/home/CurrentEventSection";
import MysteryPrizesSection from "@/components/home/MysteryPrizesSection";
import CluesSection from "@/components/home/CluesSection";
import BriefProfileModal from "@/components/profile/BriefProfileModal";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const navigate = useNavigate();

  // Mock: change with real profileImage
  const profileImage = null; // you can use a default image or the one saved
  
  return (
    <div className="pb-20 min-h-screen bg-black">
      <header className="px-4 py-6 flex justify-between items-center border-b border-projectx-deep-blue">
        {/* Profile image (left side) */}
        <button
          className="flex items-center mr-2"
          onClick={() => setShowProfileModal(true)}
        >
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-projectx-neon-blue bg-projectx-deep-blue flex items-center justify-center">
            {profileImage ? (
              <img 
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-6 h-6 text-projectx-neon-blue" />
            )}
          </div>
        </button>
        <h1 className="text-2xl font-bold neon-text flex-1 text-center">M1ssion</h1>
        
        {/* Notification envelope toggle (right side) */}
        <button
          className="ml-auto p-2 rounded-full bg-projectx-deep-blue hover:bg-projectx-neon-blue transition-colors"
          onClick={() => navigate("/notifications")}
        >
          <Mail className="w-5 h-5" />
        </button>
      </header>

      <CurrentEventSection />
      <MysteryPrizesSection />
      <CluesSection />

      <BottomNavigation />

      <BriefProfileModal
        open={showProfileModal}
        onClose={() => setShowProfileModal(false)}
      />
    </div>
  );
};

export default Home;
