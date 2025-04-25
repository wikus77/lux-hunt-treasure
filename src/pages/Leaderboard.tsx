
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";
import { useNotifications } from '@/hooks/useNotifications';
import { useBuzzSound } from '@/hooks/useBuzzSound';
import { Award, Filter, Users, Map, CalendarDays, Trophy, Search } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PlayerCard } from '@/components/leaderboard/PlayerCard';
import { LeaderboardFilters } from '@/components/leaderboard/LeaderboardFilters';
import { LeaderboardTopUsers } from '@/components/leaderboard/LeaderboardTopUsers';
import { UserRankBadge } from '@/components/leaderboard/UserRankBadge';
import { TeamCard } from '@/components/leaderboard/TeamCard';
import { CreateTeamDialog } from '@/components/leaderboard/CreateTeamDialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

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
  const [visiblePlayers, setVisiblePlayers] = useState(20); // Per caricamento paginato
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
    playSound(); // Fixed: removed argument
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
      playSound(); // Fixed: removed argument
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
          {/* Header con titolo e filtri */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  M1SSION
                </span>
              </h1>
              <div className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-500" />
                <p className="text-cyan-400 text-lg font-light tracking-wider">CLASSIFICA</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <LeaderboardFilters onFilterChange={setFilter} />
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-black/40 border-white/10"
                onClick={() => simulateRankChange()}
              >
                <CalendarDays className="h-4 w-4 mr-2" />
                SIMULA
              </Button>
            </div>
          </div>
          
          {/* Barra di ricerca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              className="pl-10 bg-black/60 border-cyan-800/30 focus:border-cyan-400/50 rounded-lg"
              placeholder="Cerca giocatore..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Top 3 giocatori in evidenza */}
          <LeaderboardTopUsers players={samplePlayers.slice(0, 3)} />
          
          {/* Tabs per alternare tra giocatori e squadre */}
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
              <ScrollArea className="max-h-[60vh] pr-4 -mr-4">
                <div className="space-y-4">
                  <AnimatePresence>
                    {filteredPlayers.map((player) => (
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
                          onInvite={() => handleInvite(player)}
                          onCreateTeam={() => handleCreateTeamAndInvite(player)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {/* Pulsante "Carica altri" */}
                  {visiblePlayers < samplePlayers.length && (
                    <div className="py-4 flex justify-center">
                      <Button
                        variant="outline"
                        className="w-full max-w-xs bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-cyan-500/50"
                        disabled={isLoading}
                        onClick={handleLoadMore}
                      >
                        {isLoading ? <LoadingSpinner size="sm" /> : "Carica altri giocatori"}
                      </Button>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="teams" className="mt-0">
              <div className="space-y-4">
                {sampleTeams.map((team) => (
                  <TeamCard key={team.id} team={team} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Indicazione progresso in classifica */}
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
      
      {/* Dialog per creazione squadra */}
      <CreateTeamDialog
        open={showCreateTeamDialog}
        onClose={() => setShowCreateTeamDialog(false)}
        player={selectedPlayer}
      />
    </div>
  );
};

export default Leaderboard;
