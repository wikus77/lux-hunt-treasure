
import { ListFilter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ProgressBar from "./ProgressBar";
import { AchievementCategory } from "@/data/achievementsData";

interface CategoryTabsProps {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
  categoryProgress: {
    unlockedCount: number;
    totalCount: number;
    percentage: number;
  };
  showSortOptions: boolean;
  setShowSortOptions: (show: boolean) => void;
  sortOption: string;
  renderSortMenu: () => React.ReactNode;
}

const CategoryTabs = ({
  activeCategory,
  setActiveCategory,
  categoryProgress,
  showSortOptions,
  setShowSortOptions,
  sortOption,
  renderSortMenu
}: CategoryTabsProps) => {
  return (
    <Tabs defaultValue={activeCategory} className="mb-6" onValueChange={setActiveCategory}>
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
  );
};

export default CategoryTabs;
