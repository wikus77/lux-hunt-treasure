
import { HelpCircle, ChevronRight } from "lucide-react";

const SupportSection = () => {
  return (
    <section className="p-4">
      <h2 className="text-xl font-bold mb-4">Supporto</h2>
      
      <div className="glass-card flex justify-between items-center p-4">
        <div className="flex items-center">
          <HelpCircle className="h-5 w-5 mr-3 text-projectx-neon-blue" />
          <span>Aiuto e FAQ</span>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>
    </section>
  );
};

export default SupportSection;
