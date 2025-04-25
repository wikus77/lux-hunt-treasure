
import React from 'react';
import { Users, Trophy } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamCard } from './TeamCard';
import { PlayersList } from './PlayersList';

interface LeaderboardTabsProps {
  filteredPlayers: any[];
  isLoading: boolean;
  hasMorePlayers: boolean;
  sampleTeams: any[];
  onLoadMore: () => void;
  onInvite: (player: any) => void;
  onCreateTeam: (player: any) => void;
  onTabChange: (value: 'players' | 'teams') => void;
}

export const LeaderboardTabs = ({
  filteredPlayers,
  isLoading,
  hasMorePlayers,
  sampleTeams,
  onLoadMore,
  onInvite,
  onCreateTeam,
  onTabChange
}: LeaderboardTabsProps) => {
  return (
    <Tabs defaultValue="players" className="w-full" onValueChange={(v) => onTabChange(v as 'players' | 'teams')}>
      <TabsList className="grid grid-cols-2 mb-6 bg-black/50">
        <TabsTrigger value="players" className="data-[state=active]:bg-cyan-900/30 data-[state=active]:text-cyan-300">
          <Users className="h-4 w-4 mr-2" />
          Giocatori
        </TabsTrigger>
        <TabsTrigger value="teams" className="data-[state=active]:bg-purple-900/30 data-[state=active]:text-purple-300">
          <Trophy className="h-4 w-4 mr-2" />
          Squadre
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="players" className="mt-0">
        <PlayersList 
          players={filteredPlayers}
          isLoading={isLoading}
          onLoadMore={onLoadMore}
          onInvite={onInvite}
          onCreateTeam={onCreateTeam}
          hasMorePlayers={hasMorePlayers}
        />
      </TabsContent>
      
      <TabsContent value="teams" className="mt-0">
        <div className="space-y-4">
          {sampleTeams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
};
