
import { motion } from "framer-motion";
import { LucideIcon, Lock } from "lucide-react";

interface CommandModuleCardProps {
  title: string;
  icon: LucideIcon;
  unlocked: boolean;
  statusText: string;
  statusColor: string;
  height: string;
  onClick: () => void;
  children?: React.ReactNode;
  lockedMessage?: string;
  opacity?: number;
  backgroundPattern?: boolean;
  gradientOverlay?: boolean;
}

const CommandModuleCard = ({
  title,
  icon: Icon,
  unlocked,
  statusText,
  statusColor,
  height,
  onClick,
  children,
  lockedMessage = "Accesso sistema richiesto",
  opacity = 1,
  backgroundPattern = false,
  gradientOverlay = false
}: CommandModuleCardProps) => {
  return (
    <motion.div
      initial={{ opacity: opacity }}
      animate={{ opacity: unlocked ? 1 : opacity }}
      transition={{ duration: 0.5 }}
      className="relative"
      onClick={onClick}
    >
      <div className={`bg-black/60 backdrop-blur-${unlocked ? 'md' : 'sm'} border ${unlocked ? 'border-' + statusColor + '-500/50' : 'border-gray-700/30'} rounded-xl overflow-hidden`}>
        <div className="p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className={`text-lg font-medium ${unlocked ? 'text-' + statusColor + '-400' : 'text-gray-500'}`}>
              <Icon className="inline-block mr-2 w-4 h-4" /> {title}
            </h2>
            {unlocked ? (
              <span className={`text-xs bg-${statusColor}-500/20 text-${statusColor}-400 px-2 py-1 rounded-full`}>{statusText}</span>
            ) : (
              <span className="text-xs bg-gray-800 text-gray-500 px-2 py-1 rounded-full">Bloccato</span>
            )}
          </div>
          
          {unlocked ? (
            <div className={`${height} bg-black/40`}>
              {children}
            </div>
          ) : (
            <div className={`${height} bg-black/80 flex items-center justify-center relative overflow-hidden`}>
              {backgroundPattern && (
                <div className="absolute inset-0 opacity-30">
                  <div className="h-full w-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iZ3JheSIgb3BhY2l0eT0iMC4yIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiIC8+PC9zdmc+')]"></div>
                </div>
              )}
              <div className="text-center z-10">
                <Lock className="mx-auto w-6 h-6 text-gray-600 mb-2" />
                <p className="text-gray-600">{lockedMessage}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {!unlocked && gradientOverlay && (
        <motion.div 
          className="absolute inset-0 bg-black/70 pointer-events-none"
          animate={{ opacity: [0.7, 0.5, 0.7] }}
          transition={{ duration: 4, repeat: Infinity }}
        ></motion.div>
      )}

      {!unlocked && backgroundPattern && (
        <>
          <div className="absolute inset-0 bg-gradient-to-t from-black/0 to-black/70 pointer-events-none"></div>
          <div className="absolute inset-0 bg-[url('/grid-pattern.png')] bg-repeat opacity-5 pointer-events-none"></div>
        </>
      )}
    </motion.div>
  );
};

export default CommandModuleCard;
