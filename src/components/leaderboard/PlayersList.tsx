
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerCard } from './PlayerCard';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Loader } from "lucide-react";

interface PlayersListProps {
  players: any[];
  isLoading: boolean;
  onLoadMore: () => void;
  onInvite: (player: any) => void;
  onCreateTeam: (player: any) => void;
  hasMorePlayers: boolean;
}

export const PlayersList = ({ 
  players, 
  isLoading, 
  onLoadMore, 
  onInvite, 
  onCreateTeam,
  hasMorePlayers 
}: PlayersListProps) => {
  return (
    <ScrollArea className="h-[60vh] pr-4 -mr-4">
      <div className="space-y-4">
        <AnimatePresence>
          {players.map((player) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className={player.rank <= 10 ? "animate-pulse-slow" : ""}
            >
              <PlayerCard
                player={player}
                onInvite={() => onInvite(player)}
                onCreateTeam={() => onCreateTeam(player)}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        
        {hasMorePlayers && (
          <div className="py-4 flex justify-center">
            <Button
              variant="outline"
              className="w-full max-w-xs bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-cyan-500/50"
              disabled={isLoading}
              onClick={onLoadMore}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <Loader className="h-4 w-4 mr-2 animate-spin" />
                  Caricamento...
                </span>
              ) : "Carica altri giocatori"}
            </Button>
          </div>
        )}
      </div>
    </ScrollArea>
  );
};
