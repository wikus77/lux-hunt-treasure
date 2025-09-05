import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Target, 
  Clock, 
  MapPin, 
  TrendingUp, 
  Award,
  ArrowLeft,
  Calendar,
  Users,
  Zap
} from 'lucide-react';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { useLocation } from 'wouter';

const MissionSettings = () => {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background/90">
      <UnifiedHeader />
      
      <main className="pt-16 pb-20 px-4">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center space-x-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation('/settings')}
              className="p-2 hover:bg-background/50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Missioni
              </h1>
              <p className="text-muted-foreground">Configurazioni e progressi</p>
            </div>
          </div>

          {/* Current Mission */}
          <Card className="glass-card border-0 bg-card/50 backdrop-blur-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                    <Target className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Missione Corrente</CardTitle>
                    <p className="text-sm text-muted-foreground/80">Gennaio 2025</p>
                  </div>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  Attiva
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="glass-card p-4 bg-background/20 border-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-muted-foreground/80">Progresso Generale</span>
                  <span className="font-bold text-primary">45%</span>
                </div>
                <div className="w-full bg-muted/30 rounded-full h-3">
                  <div className="bg-gradient-to-r from-primary to-primary/70 h-3 rounded-full transition-all duration-500" style={{ width: '45%' }} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Mission Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="glass-card border-0 bg-card/50 backdrop-blur-md">
              <CardContent className="p-6 text-center">
                <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-400/10 w-fit mx-auto mb-3">
                  <TrendingUp className="h-8 w-8 text-blue-400" />
                </div>
                <p className="text-3xl font-bold text-foreground mb-1">7</p>
                <p className="text-sm text-muted-foreground/80">Completate</p>
              </CardContent>
            </Card>
            
            <Card className="glass-card border-0 bg-card/50 backdrop-blur-md">
              <CardContent className="p-6 text-center">
                <div className="p-3 rounded-xl bg-gradient-to-br from-yellow-500/20 to-yellow-400/10 w-fit mx-auto mb-3">
                  <Award className="h-8 w-8 text-yellow-400" />
                </div>
                <p className="text-3xl font-bold text-foreground mb-1">3</p>
                <p className="text-sm text-muted-foreground/80">Premi</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="glass-card border-0 bg-card/50 backdrop-blur-md">
            <CardHeader>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent flex items-center">
                <Zap className="h-5 w-5 mr-2 text-orange-400" />
                Azioni Rapide
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start bg-background/50 border-primary/30 hover:bg-primary/10"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Visualizza Mappa Missione
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start bg-background/50 border-primary/30 hover:bg-primary/10"
              >
                <Clock className="h-4 w-4 mr-2" />
                Cronometro Missione
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
};

export default MissionSettings;