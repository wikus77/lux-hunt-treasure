
import { HelpCircle, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";

const SupportSection = () => {
  const [isSupportSectionOpen, setIsSupportSectionOpen] = useState(false);
  const navigate = useNavigate();

  const handleFaqClick = () => {
    navigate('/help-faq');
  };

  return (
    <div className="mb-6">
      <div className="glass-card p-4">
        <Collapsible open={isSupportSectionOpen} onOpenChange={setIsSupportSectionOpen}>
          <CollapsibleTrigger className="flex items-center justify-between w-full p-0">
            <h2 className="text-lg font-semibold text-white flex items-center">
              <HelpCircle className="h-5 w-5 mr-3 text-projectx-neon-blue" />
              Supporto
            </h2>
            <ChevronRight 
              className={`h-4 w-4 transition-transform ${isSupportSectionOpen ? 'rotate-90' : ''}`} 
            />
          </CollapsibleTrigger>
          
          <CollapsibleContent className="mt-4">
            <div className="space-y-4 text-white">
              <div 
                onClick={handleFaqClick}
                className="flex justify-between items-center border-b border-white/10 pb-2 cursor-pointer hover:bg-white/5 p-3 rounded-lg border border-white/10 bg-black/20"
              >
                <div className="flex items-center">
                  <HelpCircle className="h-5 w-5 mr-3 text-projectx-neon-blue" />
                  <span>Aiuto e FAQ</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

export default SupportSection;
