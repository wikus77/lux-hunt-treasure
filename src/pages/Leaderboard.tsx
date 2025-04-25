
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion'; // Add this import
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from '@/hooks/useNotifications';
import { useBuzzSound } from '@/hooks/useBuzzSound';
import { Users, Trophy } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { TeamCard } from '@/components/leaderboard/TeamCard';
import { CreateTeamDialog } from '@/components/leaderboard/CreateTeamDialog';
import { LeaderboardTopUsers } from '@/components/leaderboard/LeaderboardTopUsers';
import { LeaderboardHeader } from '@/components/leaderboard/LeaderboardHeader';
import { LeaderboardSearch } from '@/components/leaderboard/LeaderboardSearch';
import { PlayersList } from '@/components/leaderboard/PlayersList';

// Dati di esempio - Questi verranno sostituiti con dati reali dall'API
const samplePlayers = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  name: `Giocatore ${i + 1}`,
  avatar: `https://avatar.vercel.sh/player${i + 1}`,
  points: Math.floor(10000 - i * 30 + Math.random() * 20),
  rank: i + 1,
  cluesFound: Math.floor(50 - i * 0.3 + Math.random() * 10),
  areasExplored: Math.floor(20 - i * 0.1 + Math.random() * 5),
  team: i % 5 === 0 ? "Team Alpha" : i % 7 === 0 ? "Team Omega" : i % 3 === 0 ? "Team Gamma" : null,
  country: i % 4 === 0 ? "🇮🇹" : i % 3 === 0 ? "🇬🇧" : i % 5 === 0 ? "🇺🇸" : "🇪🇺",
  badges: i < 5 ? ["top10", "explorer"] : i < 15 ? ["explorer"] : i % 7 === 0 ? ["active"] : [],
  dailyChange: i % 3 === 0 ? Math.floor(Math.random() * 3) + 1 : i % 7 === 0 ? -Math.floor(Math.random() * 3) - 1 : 0,
}));

// Dati di esempio per le squadre
const sampleTeams = [
  { id: 1, name: "Team Alpha", members: 12, totalPoints: 42500, rank: 1, badges: ["top"] },
  { id: 2, name: "Team Omega", members: 8, totalPoints: 38700, rank: 2, badges: ["top"] },
  { id: 3, name: "Team Gamma", members: 15, totalPoints: 35600, rank: 3, badges: ["top"] },
  { id: 4, name: "Team Delta", members: 6, totalPoints: 29800, rank: 4, badges: [] },
  { id: 5, name: "Team Epsilon", members: 10, totalPoints: 27500, rank: 5, badges: [] },
];

const Leaderboard = () => {
  // Stati e hooks
  const [filter, setFilter] = useState<'all' | 'team' | 'country' | '7days'>('all');
  const [activeTab, setActiveTab] = useState<'players' | 'teams'>('players');
  const [searchQuery, setSearchQuery] = useState('');
  const [visiblePlayers, setVisiblePlayers] = useState(50); // Impostiamo visiblePlayers a 50 per mostrare più giocatori inizialmente
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  const { playSound } = useBuzzSound();

  // Filtraggio giocatori in base ai criteri
  const filteredPlayers = samplePlayers.filter(player => {
    // Applica il filtro di ricerca
    if (searchQuery && !player.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Applica filtri specifici
    if (filter === 'team' && !player.team) return false;
    if (filter === 'country' && player.country !== "🇮🇹") return false; // Esempio: mostra solo italiani
    if (filter === '7days') {
      // Logica per i giocatori attivi negli ultimi 7 giorni (esempio)
      return player.cluesFound > 10;
    }
    
    return true;
  }).slice(0, visiblePlayers);

  // Gestione caricamento paginato
  const handleLoadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setVisiblePlayers(prev => Math.min(prev + 15, samplePlayers.length));
      setIsLoading(false);
    }, 800);
  };

  // Gestione invito giocatore
  const handleInvite = (player: any) => {
    setSelectedPlayer(player);
    toast({
      title: "Invito inviato!",
      description: `Hai invitato ${player.name} a unirsi alla tua squadra.`
    });
    playSound();
  };

  // Gestione creazione nuova squadra e invito
  const handleCreateTeamAndInvite = (player: any) => {
    setSelectedPlayer(player);
    setShowCreateTeamDialog(true);
  };
  
  // Funzione per simulare l'animazione di un cambio di posizione in classifica
  const simulateRankChange = () => {
    const randomIndex = Math.floor(Math.random() * 10);
    const direction = Math.random() > 0.5 ? 1 : -1;
    const player = samplePlayers[randomIndex];
    const change = direction * (Math.floor(Math.random() * 2) + 1);
    
    const message = change > 0 
      ? `${player.name} è salito di ${change} posizioni!` 
      : `${player.name} è sceso di ${Math.abs(change)} posizioni!`;
    
    addNotification({
      title: "Aggiornamento Classifica",
      description: message
    });
    
    // Se entra nella top 10, effetti speciali
    if (player.rank - change <= 10 && player.rank > 10) {
      playSound();
      addNotification({
        title: "🏆 Traguardo Importante!",
        description: `${player.name} è entrato nella TOP 10!`
      });
    }
  };

  // Esempio di simulazione di cambiamenti nella classifica
  useEffect(() => {
    // Simula cambiamenti ogni 15-30 secondi
    const timer = setInterval(() => {
      if (Math.random() > 0.7) {
        simulateRankChange();
      }
    }, 15000 + Math.random() * 15000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white pt-4 pb-20">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <LeaderboardHeader 
            onSimulateRankChange={simulateRankChange} 
            onFilterChange={setFilter}
          />
          <LeaderboardSearch value={searchQuery} onChange={setSearchQuery} />
          <LeaderboardTopUsers players={samplePlayers.slice(0, 3)} />
          
          <Tabs defaultValue="players" className="w-full" onValueChange={(v) => setActiveTab(v as any)}>
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
                onLoadMore={handleLoadMore}
                onInvite={handleInvite}
                onCreateTeam={handleCreateTeamAndInvite}
                hasMorePlayers={visiblePlayers < samplePlayers.length}
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
          
          <div className="mt-8 bg-black/40 p-4 rounded-lg border border-white/5">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-400">La tua posizione:</span>
              <span className="font-bold text-cyan-400">42/100</span>
            </div>
            <Progress value={58} className="h-2 bg-gray-900">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full" style={{ width: '58%' }} />
            </Progress>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Top 100</span>
              <span>Top 10</span>
              <span>Top 3</span>
            </div>
          </div>
        </motion.div>
      </div>
      
      <CreateTeamDialog
        open={showCreateTeamDialog}
        onClose={() => setShowCreateTeamDialog(false)}
        player={selectedPlayer}
      />
    </div>
  );
};

export default Leaderboard;
