
import { useState, useEffect } from "react";
import UnifiedHeader from "@/components/layout/UnifiedHeader";
import { useAchievements } from "@/hooks/useAchievements";
import { useBuzzClues } from "@/hooks/useBuzzClues";
import AchievementBadge from "@/components/achievements/AchievementBadge";
import ProgressBar from "@/components/achievements/ProgressBar";
import { Trophy, Award, Medal, Star, ListFilter, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AchievementCategory } from "@/data/achievementsData";
import AchievementPopup from "@/components/achievements/AchievementPopup";

type SortOption = "default" | "unlocked" | "locked" | "recent";

const Achievements = () => {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const { achievements, resetAchievements } = useAchievements();
  const { unlockedClues, MAX_CLUES } = useBuzzClues();
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [sortOption, setSortOption] = useState<SortOption>("default");
  const [showSortOptions, setShowSortOptions] = useState(false);
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);

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

  const categoryProgress = calculateCategoryProgress(activeCategory);

  return (
    <div className="pb-20 min-h-screen bg-black w-full">
      <UnifiedHeader profileImage={profileImage} />
      
      <div className="h-[72px] w-full" />
      
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-projectx-gold" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-projectx-blue to-projectx-pink bg-clip-text text-transparent">
              Traguardi
            </h1>
          </div>
          
          <div className="text-sm px-3 py-1 rounded-full bg-projectx-deep-blue/50 backdrop-blur-sm border border-projectx-blue/20">
            <span className="text-projectx-blue font-mono">
              {unlockedClues} / {MAX_CLUES} 
            </span>
            <span className="text-gray-400 ml-1">indizi sbloccati</span>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="glass-card p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Medal className="w-5 h-5 text-projectx-gold" /> Progresso Complessivo
            </h2>
            <span className="text-sm text-white/70">
              {achievements.filter(a => a.isUnlocked).length} / {achievements.length} sbloccati
            </span>
          </div>
          
          <ProgressBar 
            value={unlockedClues} 
            max={MAX_CLUES} 
            size="lg" 
            colorClass="bg-gradient-to-r from-projectx-blue via-projectx-pink to-projectx-blue"
          />
          
          <div className="mt-4 flex justify-end">
            <Button 
              variant="outline" 
              size="sm"
              onClick={resetAchievements}
              className="text-xs"
            >
              Azzera Traguardi
            </Button>
          </div>
        </div>

        {/* Tabs for Categories */}
        <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveCategory}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Award className="w-5 h-5 text-projectx-pink" /> Categorie
            </h2>
            
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-8 gap-1"
                onClick={() => setShowSortOptions(!showSortOptions)}
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span>{sortOption === "default" ? "Ordina" : "Ordinati"}</span>
              </Button>
              
              {showSortOptions && renderSortMenu()}
            </div>
          </div>

          <TabsList className="grid grid-cols-5 h-auto p-1 bg-black/60 border border-white/10">
            <TabsTrigger value="all" className="py-1 text-xs">Tutti</TabsTrigger>
            <TabsTrigger value="luoghi" className="py-1 text-xs">Luoghi</TabsTrigger>
            <TabsTrigger value="auto" className="py-1 text-xs">Auto</TabsTrigger>
            <TabsTrigger value="foto" className="py-1 text-xs">Foto</TabsTrigger>
            <TabsTrigger value="completamento" className="py-1 text-xs">Completo</TabsTrigger>
          </TabsList>

          <TabsContent value={activeCategory} className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-white/80">
                {categoryProgress.unlockedCount} di {categoryProgress.totalCount} sbloccati
              </span>
              <span className="text-xs text-white/60">
                {categoryProgress.percentage}% completato
              </span>
            </div>
            
            <ProgressBar 
              value={categoryProgress.unlockedCount} 
              max={categoryProgress.totalCount} 
              size="md" 
              showPercentage={false}
              colorClass={
                activeCategory === "luoghi" ? "bg-gradient-to-r from-blue-400 to-blue-600" :
                activeCategory === "auto" ? "bg-gradient-to-r from-red-400 to-red-600" :
                activeCategory === "foto" ? "bg-gradient-to-r from-purple-400 to-purple-600" :
                activeCategory === "detective" ? "bg-gradient-to-r from-green-400 to-green-600" :
                activeCategory === "completamento" ? "bg-gradient-to-r from-amber-400 to-amber-600" :
                "bg-gradient-to-r from-projectx-blue to-projectx-pink"
              }
            />
          </TabsContent>
        </Tabs>

        {/* Achievement Grid */}
        <div className="glass-card p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-300" /> Collezione Traguardi
            </h2>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
            {sortedAchievements.map((achievement) => (
              <AchievementBadge
                key={achievement.id}
                achievement={achievement}
                size="md"
                onClick={() => setSelectedAchievement(achievement)}
                className="mx-auto"
              />
            ))}
            
            {sortedAchievements.length === 0 && (
              <div className="col-span-full py-8 text-center">
                <p className="text-white/60">Nessun traguardo in questa categoria</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Achievement Popup */}
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
