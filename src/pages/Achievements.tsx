
import { useState } from "react";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import { useAchievements } from "@/hooks/useAchievements";
import AchievementHeader from "@/components/achievements/AchievementHeader";
import OverallProgress from "@/components/achievements/OverallProgress";
import CategoryTabs from "@/components/achievements/CategoryTabs";
import AchievementGrid from "@/components/achievements/AchievementGrid";
import AchievementPopup from "@/components/achievements/AchievementPopup";
import { Achievement } from "@/data/achievementsData";

type SortOption = "default" | "unlocked" | "locked" | "recent";

const Achievements = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { achievements, resetAchievements } = useAchievements();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);

  useEffect(() => {
    setProfileImage(localStorage.getItem('profileImage'));
  }, []);

  const filteredAchievements = achievements.filter((achievement) => {
    if (activeCategory === "all") return true;
    return achievement.category === activeCategory;
  });

  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    switch (sortOption) {
      case "unlocked":
        return a.isUnlocked === b.isUnlocked ? 0 : a.isUnlocked ? -1 : 1;
      case "locked":
        return a.isUnlocked === b.isUnlocked ? 0 : a.isUnlocked ? 1 : -1;
      case "recent":
        if (!a.unlockedAt && !b.unlockedAt) return 0;
        if (!a.unlockedAt) return 1;
        if (!b.unlockedAt) return -1;
        return new Date(b.unlockedAt).getTime() - new Date(a.unlockedAt).getTime();
      default:
        return 0;
    }
  });

  const calculateCategoryProgress = (category: string) => {
    const categoryAchievements = achievements.filter(a => 
      category === "all" ? true : a.category === category
    );
    
    const unlockedCount = categoryAchievements.filter(a => a.isUnlocked).length;
    const totalCount = categoryAchievements.length;
    
    return {
      unlockedCount,
      totalCount,
      percentage: totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0
    };
  };

  const renderSortMenu = () => (
    <div className="bg-black/90 border border-white/10 rounded-lg p-3 shadow-lg absolute right-0 top-full mt-2 z-50 w-48">
      <p className="text-xs text-white/70 mb-2 pb-1 border-b border-white/10">Ordina per:</p>
      <div className="space-y-2">
        {[
          { id: "default", label: "Predefinito" },
          { id: "unlocked", label: "Sbloccati prima" },
          { id: "locked", label: "Bloccati prima" },
          { id: "recent", label: "Più recenti" },
        ].map((option) => (
          <button
            key={option.id}
            className={`w-full text-left px-2 py-1 text-sm rounded hover:bg-white/10 ${
              sortOption === option.id ? "bg-white/10 font-medium" : ""
            }`}
            onClick={() => {
              setSortOption(option.id as SortOption);
              setShowSortOptions(false);
            }}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="pb-20 min-h-screen bg-black w-full">
      <UnifiedHeader profileImage={profileImage} />
      
      <div className="h-[72px] w-full" />
      
      <div className="max-w-4xl mx-auto px-4">
        <AchievementHeader />
        
        <OverallProgress onResetAchievements={resetAchievements} />
        
        <CategoryTabs 
          activeCategory={activeCategory}
          setActiveCategory={setActiveCategory}
          categoryProgress={calculateCategoryProgress(activeCategory)}
          showSortOptions={showSortOptions}
          setShowSortOptions={setShowSortOptions}
          sortOption={sortOption}
          renderSortMenu={renderSortMenu}
        />
        
        <AchievementGrid 
          achievements={sortedAchievements}
          onAchievementClick={setSelectedAchievement}
        />
      </div>
      
      {selectedAchievement && (
        <AchievementPopup 
          achievement={selectedAchievement}
          onClose={() => setSelectedAchievement(null)}
        />
      )}
    </div>
  );
};

export default Achievements;
