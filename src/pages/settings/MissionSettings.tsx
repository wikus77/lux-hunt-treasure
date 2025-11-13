import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Target, 
  Clock, 
  MapPin, 
  TrendingUp, 
  Award,
  Calendar,
  Users,
  Zap
} from 'lucide-react';
import UnifiedHeader from '@/components/layout/UnifiedHeader';
import BottomNavigation from '@/components/layout/BottomNavigation';
import { useWouterNavigation } from '@/hooks/useWouterNavigation';
import { useAuth } from '@/hooks/use-auth';
import { useProfileImage } from '@/hooks/useProfileImage';
import { usePerformanceSettings } from '@/hooks/usePerformanceSettings';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const MissionSettings: React.FC = () => {
  const { navigate } = useWouterNavigation();
  const { user } = useAuth();
  const { profileImage } = useProfileImage();
  const { battleFxMode, setBattleFxMode, isLoading } = usePerformanceSettings();

  return (
    <div className="min-h-screen">
      <UnifiedHeader profileImage={profileImage || user?.user_metadata?.avatar_url} />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="px-4 space-y-6"
        style={{ 
          paddingTop: 'calc(72px + 47px + env(safe-area-inset-top, 0px))',
          paddingBottom: 'calc(80px + env(safe-area-inset-bottom, 0px))'
        }}
      >
        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-2xl font-bold text-white font-orbitron">Missione</h1>
          <p className="text-white/70">Gestisci le tue missioni e obiettivi</p>
        </div>

        {/* Current Mission */}
        <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-[#00D1FF]/20">
                  <Target className="h-6 w-6 text-[#00D1FF]" />
                </div>
                <div>
                  <CardTitle className="text-xl text-white font-orbitron">Missione Corrente</CardTitle>
                  <p className="text-sm text-white/70">Gennaio 2025</p>
                </div>
              </div>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                Attiva
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-black/20 rounded-lg border border-white/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-white/70">Progresso Generale</span>
                <span className="font-bold text-[#00D1FF]">45%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div className="bg-gradient-to-r from-[#00D1FF] to-[#00B8E6] h-3 rounded-full transition-all duration-500" style={{ width: '45%' }} />
              </div>
            </div>
          </CardContent>
          </Card>

        {/* Mission Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="p-3 rounded-xl bg-[#00D1FF]/20 w-fit mx-auto mb-3">
                <TrendingUp className="h-8 w-8 text-[#00D1FF]" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">7</p>
              <p className="text-sm text-white/70">Completate</p>
            </CardContent>
          </Card>
          
          <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="p-3 rounded-xl bg-yellow-500/20 w-fit mx-auto mb-3">
                <Award className="h-8 w-8 text-yellow-400" />
              </div>
              <p className="text-3xl font-bold text-white mb-1">3</p>
              <p className="text-sm text-white/70">Premi</p>
            </CardContent>
          </Card>
        </div>

        {/* Battle FX Performance Settings */}
        <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white font-orbitron flex items-center">
              <Zap className="h-5 w-5 mr-2 text-[#00D1FF]" />
              Battle FX Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/90">
                Performance Mode
              </label>
              <p className="text-xs text-white/60 mb-2">
                Regola la qualità degli effetti visivi Battle per ottimizzare le prestazioni
              </p>
              <Select
                value={battleFxMode}
                onValueChange={(value: 'high' | 'low') => setBattleFxMode(value)}
                disabled={isLoading}
              >
                <SelectTrigger className="w-full bg-black/20 border-white/20 text-white">
                  <SelectValue placeholder="Seleziona modalità" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">
                    <div className="flex flex-col">
                      <span className="font-medium">Alta Qualità</span>
                      <span className="text-xs text-muted-foreground">Effetti completi e ricchi</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="low">
                    <div className="flex flex-col">
                      <span className="font-medium">Performance</span>
                      <span className="text-xs text-muted-foreground">Effetti semplificati per device meno potenti</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-black/40 border-[#00D1FF]/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-white font-orbitron flex items-center">
              <Zap className="h-5 w-5 mr-2 text-[#00D1FF]" />
              Azioni Rapide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start bg-black/20 border-white/20 text-white hover:bg-white/10"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Visualizza Mappa Missione
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start bg-black/20 border-white/20 text-white hover:bg-white/10"
            >
              <Clock className="h-4 w-4 mr-2" />
              Cronometro Missione
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bottom Navigation */}
      <div 
        style={{ 
          position: 'fixed', 
          bottom: 0, 
          left: 0, 
          right: 0, 
          width: '100vw',
          zIndex: 10000
        } as React.CSSProperties}
      >
        <BottomNavigation />
      </div>
    </div>
  );
};

export default MissionSettings;