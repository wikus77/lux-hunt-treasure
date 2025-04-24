
import { UserStatsDashboard } from "@/components/stats/UserStatsDashboard";
import { UserLeaderboard } from "@/components/leaderboards/UserLeaderboard";
import { UserReputationSystem } from "@/components/reputation/UserReputationSystem";
import { SocialShareButtons } from "@/components/social/SocialShareButtons";

const Stats = () => {
  return (
    <div className="container mx-auto p-4 space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold gradient-text">Dashboard Utente</h1>
        <SocialShareButtons 
          title="Le mie statistiche su Mystery Hunt!"
          description="Scopri come sto procedendo nella caccia agli indizi!"
        />
      </div>

      <UserStatsDashboard />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserLeaderboard />
        <UserReputationSystem />
      </div>
    </div>
  );
};

export default Stats;
