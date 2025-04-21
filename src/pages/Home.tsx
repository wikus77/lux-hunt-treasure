
import { useState } from "react";
import { User, Mail, MoreVertical, Circle } from "lucide-react";
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
      <header className="px-4 py-6 flex items-center border-b border-projectx-deep-blue gap-3">
        {/* Profile image - ridotta */}
        <button
          className="flex items-center"
          onClick={() => setShowProfileModal(true)}
        >
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-projectx-neon-blue bg-projectx-deep-blue flex items-center justify-center">
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-5 h-5 text-projectx-neon-blue" />
            )}
          </div>
        </button>
        {/* Title centered */}
        <h1 className="text-2xl font-bold neon-text flex-1 text-center">M1ssion</h1>
        {/* Mail icon and Three dots/settings icon on right */}
        <button
          className="p-2 rounded-full bg-projectx-deep-blue hover:bg-projectx-neon-blue transition-colors"
          onClick={() => navigate("/notifications")}
        >
          <Mail className="w-5 h-5" />
        </button>
        <button
          className="p-2 rounded-full bg-projectx-deep-blue hover:bg-projectx-neon-blue transition-colors"
          onClick={() => navigate("/settings")}
        >
          <MoreVertical className="w-5 h-5" />
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
