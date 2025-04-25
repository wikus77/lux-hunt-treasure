
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Medal, 
  Award, 
  Star, 
  Users, 
  Calendar, 
  Map, 
  Filter 
} from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useNotifications } from "@/hooks/useNotifications";
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { LeaderboardTopUsers } from '@/components/leaderboard/LeaderboardTopUsers';
import { LeaderboardFilters } from '@/components/leaderboard/LeaderboardFilters';
import { UserLeaderboard } from '@/components/leaderboards/UserLeaderboard';

interface LeaderboardUser {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  rank: number;
  previousRank?: number;
  cluesFound: number;
  areasExplored: number;
  badgeType?: 'discoverer' | 'active' | 'rising' | 'teamPlayer';
  badgeLabel?: string;
  team?: string;
  country?: string;
  reputation: number;
}

const Leaderboard = () => {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'allTime'>('weekly');
  const [filter, setFilter] = useState<'all' | 'team' | 'country'>('all');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { addNotification } = useNotifications();
  
  // Questa funzione simula il recupero dei dati della classifica
  // In una implementazione reale, dovrebbe chiamare l'API Supabase
  const fetchLeaderboardData = () => {
    setIsLoading(true);
    
    // Simuliamo un ritardo di caricamento
    setTimeout(() => {
      setIsLoading(false);
    }, 800);
  };
  
  useEffect(() => {
    fetchLeaderboardData();
    
    // Simula una notifica di congratulazioni per entrare nella top 100
    const timer = setTimeout(() => {
      addNotification({
        title: "🏆 Complimenti!",
        description: "Sei entrato nella classifica dei migliori 100 giocatori!"
      });
      
      // Mostra un toast
      toast({
        title: "Hai guadagnato posizioni!",
        description: "Sei salito di 3 posizioni nella classifica settimanale.",
      });
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Effetto che si attiva quando cambiamo periodo o filtro
  useEffect(() => {
    fetchLeaderboardData();
  }, [period, filter]);
  
  return (
    <div className="pb-20 min-h-screen bg-black text-white w-full px-4 pt-4">
      <div className="max-w-screen-xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
            <Award className="h-7 w-7 text-projectx-gold" />
            <span className="gradient-text-multi">Classifica Giocatori</span>
          </h1>
          <p className="text-gray-400">
            Scopri chi sono i migliori giocatori di M1SSION e scala la classifica!
          </p>
        </motion.div>

        {/* Sezione Top Users - La card evidenziata dei primi 3 */}
        <LeaderboardTopUsers />

        {/* Sezione tabella principale */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8"
        >
          <div className="glass-card mb-6">
            <Tabs defaultValue="weekly" onValueChange={(val) => setPeriod(val as any)}>
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <TabsList className="bg-black/40">
                  <TabsTrigger value="weekly" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-projectx-blue data-[state=active]:to-projectx-pink">
                    Settimanale
                  </TabsTrigger>
                  <TabsTrigger value="monthly" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-projectx-blue data-[state=active]:to-projectx-pink">
                    Mensile
                  </TabsTrigger>
                  <TabsTrigger value="allTime" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-projectx-blue data-[state=active]:to-projectx-pink">
                    All-Time
                  </TabsTrigger>
                </TabsList>
              
                <LeaderboardFilters onFilterChange={setFilter} />
              </div>

              {/* Contenuto delle tab */}
              <TabsContent value="weekly" className="mt-4">
                <UserLeaderboard />
              </TabsContent>
              
              <TabsContent value="monthly" className="mt-4">
                <UserLeaderboard />
              </TabsContent>
              
              <TabsContent value="allTime" className="mt-4">
                <UserLeaderboard />
              </TabsContent>
            </Tabs>
          </div>
        </motion.div>
        
        {/* Informazioni aggiuntive */}
        <div className="mt-12 text-center text-gray-400 text-sm">
          <p>La classifica viene aggiornata ogni 24 ore. Ultimo aggiornamento: {formatDistanceToNow(new Date(), { addSuffix: true, locale: it })}</p>
          <p className="mt-2">Continua ad esplorare e svelare indizi per scalare la classifica!</p>
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
