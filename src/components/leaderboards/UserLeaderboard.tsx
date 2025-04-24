
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { Trophy, Award, Star } from "lucide-react";

interface UserRanking {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  cluesFound: number;
  areasExplored: number;
  reputation: number;
  reputationCount: number;
}

// Sample data - In a real implementation this would come from an API
const sampleWeeklyLeaderboard: UserRanking[] = [
  { id: "1", name: "Marco B.", avatar: "", score: 780, cluesFound: 35, areasExplored: 12, reputation: 4.9, reputationCount: 42 },
  { id: "2", name: "Giulia S.", avatar: "", score: 750, cluesFound: 32, areasExplored: 14, reputation: 4.8, reputationCount: 36 },
  { id: "3", name: "Alessandro R.", avatar: "", score: 720, cluesFound: 30, areasExplored: 15, reputation: 4.7, reputationCount: 28 },
  { id: "4", name: "Francesca M.", avatar: "", score: 690, cluesFound: 31, areasExplored: 11, reputation: 4.5, reputationCount: 22 },
  { id: "5", name: "Lorenzo P.", avatar: "", score: 650, cluesFound: 28, areasExplored: 10, reputation: 4.6, reputationCount: 19 },
  { id: "6", name: "Sophia G.", avatar: "", score: 620, cluesFound: 26, areasExplored: 12, reputation: 4.3, reputationCount: 25 },
  { id: "7", name: "Carlo V.", avatar: "", score: 600, cluesFound: 24, areasExplored: 10, reputation: 4.4, reputationCount: 18 },
  { id: "8", name: "Anna F.", avatar: "", score: 580, cluesFound: 25, areasExplored: 9, reputation: 4.2, reputationCount: 31 },
  { id: "9", name: "Roberto D.", avatar: "", score: 560, cluesFound: 23, areasExplored: 8, reputation: 4.3, reputationCount: 15 },
  { id: "10", name: "Elena Z.", avatar: "", score: 530, cluesFound: 21, areasExplored: 9, reputation: 4.1, reputationCount: 23 },
];

// Months in Italian
const months = ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"];
const now = new Date();
const currentMonth = months[now.getMonth()];

export function UserLeaderboard() {
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState<UserRanking[]>(sampleWeeklyLeaderboard);
  const [monthlyLeaderboard, setMonthlyLeaderboard] = useState<UserRanking[]>([]);
  const [allTimeLeaderboard, setAllTimeLeaderboard] = useState<UserRanking[]>([]);
  const [reputationLeaderboard, setReputationLeaderboard] = useState<UserRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Simulate API calls to fetch different leaderboards
    const fetchLeaderboards = () => {
      setIsLoading(true);
      
      // In a real app, these would be API calls
      setTimeout(() => {
        setWeeklyLeaderboard(sampleWeeklyLeaderboard);
        
        // Create different data for other tabs
        setMonthlyLeaderboard([...sampleWeeklyLeaderboard]
          .sort((a, b) => b.cluesFound - a.cluesFound)
          .map(user => ({ ...user, score: user.score * 3.5 }))
        );
        
        setAllTimeLeaderboard([...sampleWeeklyLeaderboard]
          .sort((a, b) => b.areasExplored - a.areasExplored)
          .map(user => ({ ...user, score: user.score * 8.2 }))
        );
        
        setReputationLeaderboard([...sampleWeeklyLeaderboard]
          .sort((a, b) => b.reputation - a.reputation)
        );
        
        setIsLoading(false);
      }, 800);
    };
    
    fetchLeaderboards();
  }, []);
  
  const getRankColor = (rank: number): string => {
    if (rank === 0) return "text-projectx-gold";
    if (rank === 1) return "text-slate-300";
    if (rank === 2) return "text-amber-600";
    return "text-gray-200";
  };
  
  const getRankIcon = (rank: number) => {
    if (rank === 0) return <Trophy className="h-5 w-5 text-projectx-gold" />;
    if (rank === 1) return <Trophy className="h-5 w-5 text-slate-300" />;
    if (rank === 2) return <Trophy className="h-5 w-5 text-amber-600" />;
    return <span className="font-bold">{rank + 1}</span>;
  };
  
  const renderLeaderboardTable = (leaderboard: UserRanking[]) => (
    <div className="space-y-2">
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-projectx-blue"></div>
        </div>
      ) : (
        leaderboard.map((user, index) => (
          <div
            key={user.id}
            className={`flex items-center justify-between p-3 border-b border-gray-800 ${
              index < 3 ? 'bg-black/50' : 'hover:bg-black/30'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8">
                {getRankIcon(index)}
              </div>
              <Avatar className="h-10 w-10 border border-gray-700">
                <img
                  src={user.avatar || `https://avatar.vercel.sh/${user.name}`}
                  alt={user.name}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://avatar.vercel.sh/${user.name}`;
                  }}
                />
              </Avatar>
              <div>
                <p className={`font-medium ${getRankColor(index)}`}>{user.name}</p>
                <div className="flex items-center text-xs text-gray-400 gap-1">
                  <Star className="h-3 w-3 text-yellow-400" />{user.reputation} ({user.reputationCount})
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold">{user.score}</p>
              <p className="text-xs text-gray-400">
                {user.cluesFound} indizi · {user.areasExplored} aree
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
  
  return (
    <Card className="w-full bg-black/40 backdrop-blur-sm border-projectx-deep-blue/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-6 w-6 text-projectx-gold" />
          Classifiche
        </CardTitle>
        <CardDescription>
          Utenti più attivi e che hanno fatto più progressi
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="weekly">
          <TabsList className="w-full bg-black/50">
            <TabsTrigger value="weekly" className="flex-1">Settimanale</TabsTrigger>
            <TabsTrigger value="monthly" className="flex-1">Mensile ({currentMonth})</TabsTrigger>
            <TabsTrigger value="alltime" className="flex-1">All Time</TabsTrigger>
            <TabsTrigger value="reputation" className="flex-1">Reputazione</TabsTrigger>
          </TabsList>
          
          <TabsContent value="weekly" className="mt-4">
            {renderLeaderboardTable(weeklyLeaderboard)}
          </TabsContent>
          
          <TabsContent value="monthly" className="mt-4">
            {renderLeaderboardTable(monthlyLeaderboard)}
          </TabsContent>
          
          <TabsContent value="alltime" className="mt-4">
            {renderLeaderboardTable(allTimeLeaderboard)}
          </TabsContent>
          
          <TabsContent value="reputation" className="mt-4">
            {renderLeaderboardTable(reputationLeaderboard)}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
