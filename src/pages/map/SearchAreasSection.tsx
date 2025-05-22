
import React from "react";
import { Button } from "@/components/ui/button";
import { Circle } from "lucide-react";
import { SearchArea } from "@/components/maps/types";

type SearchAreasSectionProps = {
  searchAreas: SearchArea[];
  setActiveSearchArea: (id: string | null) => void;
  clearAllSearchAreas: () => void;
};

const SearchAreasSection: React.FC<SearchAreasSectionProps> = ({
  searchAreas,
  setActiveSearchArea,
  clearAllSearchAreas
}) => (
  <>
    <div className="flex justify-between mt-6 mb-2">
      <h2 className="text-lg font-medium text-white flex items-center gap-2">
        <Circle className="h-4 w-4 text-lime-400" />
        Aree di interesse
      </h2>
      {searchAreas.length > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearAllSearchAreas}
          className="text-xs text-red-400 hover:text-red-300 hover:bg-red-900/20"
        >
          Cancella tutto
        </Button>
      )}
    </div>
    <div className="space-y-3 mt-2">
      {searchAreas.length === 0 ? (
        <div className="text-center py-4 text-gray-400">
          Nessuna area di interesse. Aggiungi un'area sulla mappa per iniziare.
        </div>
      ) : (
        searchAreas.map((area) => (
          <div
            key={`area-list-${area.id}`}
            className={`p-3 rounded-[16px] backdrop-blur-sm cursor-pointer transition-colors
              ${area.isAI
                ? "bg-[#7E69AB]/40 hover:bg-[#7E69AB]/60 border-l-4 border-[#9b87f5]"
                : "bg-projectx-deep-blue/40 hover:bg-projectx-deep-blue/60"
              }`}
            onClick={() => setActiveSearchArea(area.id)}
          >
            <div className="flex items-start gap-2">
              <Circle className={`w-5 h-5 flex-shrink-0 ${area.isAI ? "text-[#9b87f5]" : "text-lime-400"}`} />
              <div className="flex-1">
                <div className="text-sm font-medium">{area.label}</div>
                <div className="text-xs text-gray-400">Raggio: {area.radius/1000}km</div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </>
);

export default SearchAreasSection;
