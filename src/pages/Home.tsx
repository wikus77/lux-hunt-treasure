
import { useState } from "react";
import { Bell } from "lucide-react";
import BottomNavigation from "@/components/layout/BottomNavigation";
import CurrentEventSection from "@/components/home/CurrentEventSection";
import MysteryPrizesSection from "@/components/home/MysteryPrizesSection";
import CluesSection from "@/components/home/CluesSection";

const Home = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const requestNotifications = () => {
    setNotificationsEnabled(true);
  };

  return (
    <div className="pb-20 min-h-screen bg-black">
      <header className="px-4 py-6 flex justify-between items-center border-b border-projectx-deep-blue">
        <h1 className="text-2xl font-bold neon-text">M1ssion</h1>
        
        <button 
          className={`p-2 rounded-full ${notificationsEnabled ? "bg-projectx-pink" : "bg-projectx-deep-blue"}`}
          onClick={requestNotifications}
        >
          <Bell className="w-5 h-5" />
        </button>
      </header>

      <CurrentEventSection />
      <MysteryPrizesSection />
      <CluesSection />

      <BottomNavigation />
    </div>
  );
};

export default Home;
