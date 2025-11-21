
import { Shield, Lightbulb, Zap } from "lucide-react";
import CommandModuleCard from "./CommandModuleCard";

interface CommandModulesSectionProps {
  unlockedModules: {
    mission: boolean;
    analysis: boolean;
    intel: boolean;
    shortcuts: boolean;
  };
  handleModuleClick: (moduleName: string) => void;
}

const CommandModulesSection = ({ unlockedModules, handleModuleClick }: CommandModulesSectionProps) => {
  return (
    <div className="grid gap-6 px-4">
      {/* Mission Panel - Always available */}
      <CommandModuleCard
        title="Missione Attiva"
        icon={Shield}
        unlocked={unlockedModules.mission}
        statusText="Online"
        statusColor="cyan"
        height="h-40"
        onClick={() => handleModuleClick('mission')}
      >
        <div className="CommandCenter_MissionPanel h-full">
          {/* Mission content will be displayed here */}
          {/* This is just a placeholder for the actual CommandCenter component */}
        </div>
      </CommandModuleCard>
      
      {/* Analysis Board */}
      <CommandModuleCard
        title="Tavolo di Analisi"
        icon={Lightbulb}
        unlocked={unlockedModules.analysis}
        statusText="Attivo"
        statusColor="purple"
        height="h-32"
        opacity={0.4}
        onClick={() => handleModuleClick('analysis')}
        lockedMessage="Attendere primo indizio"
      >
        <div className="CommandCenter_AnalysisBoard h-full">
          {/* Analysis content */}
        </div>
      </CommandModuleCard>
      
      {/* Intel Feed */}
      <CommandModuleCard
        title="Feed Intel"
        icon={Zap}
        unlocked={unlockedModules.intel}
        statusText="Connesso"
        statusColor="amber"
        height="h-24"
        opacity={0.3}
        backgroundPattern={true}
        gradientOverlay={true}
        onClick={() => handleModuleClick('intel')}
        lockedMessage="Segnale non disponibile"
      >
        <div className="CommandCenter_IntelFeed h-full">
          {/* Intel content */}
        </div>
      </CommandModuleCard>
      
      {/* Contextual Shortcuts - Fix the icon type issue here */}
      <CommandModuleCard
        title="Accessi Rapidi"
        icon={Zap} /* Changed from () => <span></span> to a proper Lucide icon */
        unlocked={unlockedModules.shortcuts}
        statusText="Disponibile"
        statusColor="cyan"
        height="h-16"
        opacity={0.2}
        backgroundPattern={true}
        onClick={() => handleModuleClick('shortcuts')}
        lockedMessage="In attesa di connessione"
      >
        <div className="CommandCenter_Shortcuts h-full">
          {/* Shortcuts content */}
        </div>
      </CommandModuleCard>
    </div>
  );
};

export default CommandModulesSection;
