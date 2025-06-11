import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MapPin, Clock, Search, Star, Trophy, Target } from "lucide-react";
import { SocialShareButtons } from "@/components/social/SocialShareButtons";
import CountUp from 'react-countup';

interface UserStats {
  areasExplored: number;
  totalAreas: number;
  timeSpent: number;
  cluesFound: number;
  totalClues: number;
  accuracy: number;
  reputation: number;
  rank: number;
  totalUsers: number;
}

const sampleStats: UserStats = {
  areasExplored: 17,
  totalAreas: 30,
  timeSpent: 12.5, // hours
  cluesFound: 28,
  totalClues: 40,
  accuracy: 85,
  reputation: 4.2,
  rank: 37,
  totalUsers: 142
};

export function UserStatsDashboard() {
  const [stats, setStats] = useState<UserStats>(sampleStats);
  
  useEffect(() => {
    const fetchStats = () => {
      setTimeout(() => {
        setStats(sampleStats);
      }, 500);
    };
    
    fetchStats();
  }, []);
  
  return (
    <div className="w-full space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold gradient-text">Le Tue Statistiche</h2>
          <SocialShareButtons
            title="Guarda i miei progressi nella Mystery Hunt!"
            description={`Ho trovato ${stats.cluesFound} indizi su ${stats.totalClues} e sono al posto ${stats.rank} in classifica!`}
            className="scale-75"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-black/40 backdrop-blur-sm border-projectx-deep-blue/40" interactive>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-projectx-pink" />
              Aree Esplorate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  <CountUp end={stats.areasExplored} duration={2} /> su{" "}
                  <CountUp end={stats.totalAreas} duration={2} />
                </span>
                <span className="text-glow font-bold text-white text-2xl">
                  <CountUp end={Math.round((stats.areasExplored / stats.totalAreas) * 100)} duration={2} />%
                </span>
              </div>
              <Progress value={(stats.areasExplored / stats.totalAreas) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/40 backdrop-blur-sm border-projectx-deep-blue/40" interactive>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="h-5 w-5 text-projectx-blue" />
              Indizi Trovati
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>
                  <CountUp end={stats.cluesFound} duration={2} /> su{" "}
                  <CountUp end={stats.totalClues} duration={2} />
                </span>
                <span className="text-glow font-bold text-white text-2xl">
                  <CountUp end={Math.round((stats.cluesFound / stats.totalClues) * 100)} duration={2} />%
                </span>
              </div>
              <Progress value={(stats.cluesFound / stats.totalClues) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-black/40 backdrop-blur-sm border-projectx-deep-blue/40" interactive>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-projectx-neon-blue" />
              Tempo di Gioco
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-glow">
              <CountUp end={stats.timeSpent} duration={3} decimals={1} /> ore
            </p>
            <p className="text-sm text-muted-foreground">Ultima sessione: 1.5 ore fa</p>
          </CardContent>
        </Card>
        
        <Card className="bg-black/40 backdrop-blur-sm border-projectx-deep-blue/40" interactive>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-projectx-gold" />
              Precisione
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-glow">
              <CountUp end={stats.accuracy} duration={2} />%
            </p>
            <p className="text-sm text-muted-foreground">Tasso di successo indizi</p>
          </CardContent>
        </Card>
        
        <Card className="bg-black/40 backdrop-blur-sm border-projectx-deep-blue/40" interactive>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-400" />
              Reputazione
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <p className="text-3xl font-bold text-glow">
                <CountUp end={stats.reputation} duration={2} decimals={1} />
              </p>
              <div className="ml-2 flex">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${star <= Math.floor(stats.reputation) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'}`}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Basato su 27 valutazioni</p>
          </CardContent>
        </Card>
        
        <Card className="bg-black/40 backdrop-blur-sm border-projectx-deep-blue/40" interactive>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-projectx-gold" />
              Classifica
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-glow">
              #<CountUp end={stats.rank} duration={2} />
            </p>
            <p className="text-sm text-muted-foreground">
              Su <CountUp end={stats.totalUsers} duration={2} /> utenti attivi
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
