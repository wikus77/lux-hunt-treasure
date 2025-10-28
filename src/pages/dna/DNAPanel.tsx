// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useDNA } from '@/hooks/useDNA';
import { ARCHETYPE_CONFIGS } from '@/features/dna/dnaTypes';
import { Skeleton } from '@/components/ui/skeleton';

const DNAPanel: React.FC = () => {
  const [, setLocation] = useLocation();
  const { dnaProfile, isLoading } = useDNA();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-64 w-full" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!dnaProfile) {
    return (
      <div className="min-h-screen bg-black text-white p-4 flex items-center justify-center">
        <Card className="max-w-md bg-black/80 border-white/10">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="text-6xl mb-4">🧬</div>
            <div className="text-xl font-bold">DNA non inizializzato</div>
            <div className="text-white/60 text-sm">
              Torna alla home per completare la calibrazione del tuo DNA agente.
            </div>
            <Button onClick={() => setLocation('/home')} variant="outline">
              Torna alla Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const archetypeConfig = ARCHETYPE_CONFIGS[dnaProfile.archetype];
  const attributes = [
    { key: 'intuito', label: 'Intuito', icon: '🔮', value: dnaProfile.intuito },
    { key: 'audacia', label: 'Audacia', icon: '⚡', value: dnaProfile.audacia },
    { key: 'etica', label: 'Etica', icon: '⚖️', value: dnaProfile.etica },
    { key: 'rischio', label: 'Rischio', icon: '🎲', value: dnaProfile.rischio },
    { key: 'vibrazione', label: 'Vibrazione', icon: '🌊', value: dnaProfile.vibrazione }
  ];

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation('/home')}
            className="text-white/60 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              M1SSION DNA™
            </h1>
            <div className="text-sm text-white/60">Identità Evolutiva</div>
          </div>
        </div>

        {/* Archetype Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card 
            className="bg-gradient-to-br from-black/90 to-black/60 border-2 backdrop-blur-sm overflow-hidden"
            style={{ borderColor: archetypeConfig.color }}
          >
            <CardHeader className="text-center pb-3">
              <div className="text-6xl mb-4">{archetypeConfig.icon}</div>
              <CardTitle className="text-3xl font-black" style={{ color: archetypeConfig.color }}>
                {archetypeConfig.nameIt}
              </CardTitle>
              <Badge variant="outline" className="mt-2 text-xs" style={{ borderColor: archetypeConfig.color, color: archetypeConfig.color }}>
                {archetypeConfig.name}
              </Badge>
            </CardHeader>
            <CardContent>
              <p className="text-white/80 text-center leading-relaxed">
                {archetypeConfig.description}
              </p>
            </CardContent>

            {/* Animated glow effect */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(circle at 50% 0%, ${archetypeConfig.color}15, transparent 70%)`
              }}
              animate={{
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </Card>
        </motion.div>

        {/* DNA Attributes */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white/80">
            <Sparkles className="w-4 h-4" />
            <h2 className="text-lg font-bold">Attributi DNA</h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {attributes.map((attr, idx) => (
              <motion.div
                key={attr.key}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{attr.icon}</span>
                        <span className="text-sm font-bold text-white">{attr.label}</span>
                      </div>
                      <span className="text-sm text-white/60">{attr.value}/100</span>
                    </div>
                    <Progress 
                      value={attr.value} 
                      className="h-2 bg-white/10"
                    />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Info */}
        <Card className="bg-black/40 border-white/10 backdrop-blur-sm">
          <CardContent className="p-4 text-center">
            <div className="text-xs text-white/50">
              {dnaProfile.completedAt && (
                <>Calibrato il {new Date(dnaProfile.completedAt).toLocaleDateString('it-IT')}</>
              )}
            </div>
            <div className="text-xs text-white/40 mt-2">
              Il tuo DNA evolverà con le tue missioni
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DNAPanel;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
