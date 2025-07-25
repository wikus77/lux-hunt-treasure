// M1SSION™ - Agent Diary Component for iOS Capacitor
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Calendar, 
  Target, 
  MapPin, 
  Zap, 
  Trophy,
  Clock,
  ChevronRight,
  Activity,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { preserveFunctionName } from '@/utils/iosCapacitorFunctions';

interface DiaryEntry {
  id: string;
  type: 'clue_unlocked' | 'buzz_used' | 'area_unlocked' | 'mission_completed' | 'achievement';
  title: string;
  description: string;
  timestamp: string;
  location?: string;
  reward?: string;
  metadata?: any;
}

interface AgentDiaryProps {
  className?: string;
  maxEntries?: number;
}

export const AgentDiary: React.FC<AgentDiaryProps> = ({ 
  className = '', 
  maxEntries = 10 
}) => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load diary entries
  const loadDiaryEntries = preserveFunctionName(async () => {
    if (!user) return;

    try {
      setLoading(true);
      let diaryEntries: DiaryEntry[] = [];

      // Get recent clues unlocked
      const { data: clues } = await supabase
        .from('user_clues')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Process clues
      if (clues) {
        for (const clue of clues) {
          const clueEntry: DiaryEntry = {
            id: `clue_${clue.clue_id}`,
            type: 'clue_unlocked' as const,
            title: 'Indizio Sbloccato',
            description: clue.title_it,
            timestamp: clue.created_at,
            reward: `${clue.buzz_cost} crediti spesi`
          };
          diaryEntries = [...diaryEntries, clueEntry];
        }
      }

      // Get recent buzz actions
      const { data: buzzActions } = await supabase
        .from('buzz_map_actions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // Process buzz actions
      if (buzzActions) {
        for (const action of buzzActions) {
          const actionEntry: DiaryEntry = {
            id: `buzz_${action.id}`,
            type: 'buzz_used' as const,
            title: 'BUZZ Attivato',
            description: `Area di ${action.radius_generated}km sbloccata`,
            timestamp: action.created_at,
            reward: `${action.clue_count} indizi trovati`,
            metadata: { cost: action.cost_eur }
          };
          diaryEntries = [...diaryEntries, actionEntry];
        }
      }

      // Get recent map areas
      const { data: areas } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      // Process areas
      if (areas) {
        for (const area of areas) {
          const areaEntry: DiaryEntry = {
            id: `area_${area.id}`,
            type: 'area_unlocked' as const,
            title: 'Nuova Area Esplorata',
            description: `Settimana ${area.week} - Raggio ${area.radius_km}km`,
            timestamp: area.created_at,
            location: `${area.lat.toFixed(4)}, ${area.lng.toFixed(4)}`
          };
          diaryEntries = [...diaryEntries, areaEntry];
        }
      }

      // Sort by timestamp and limit
      const sortedEntries = diaryEntries
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, maxEntries);

      setEntries(sortedEntries);

    } catch (err) {
      console.error('Error loading diary entries:', err);
    } finally {
      setLoading(false);
    }
  }, 'loadDiaryEntries');

  useEffect(() => {
    loadDiaryEntries();
  }, [user]);

  // Get entry styling
  const getEntryStyle = (type: string) => {
    switch (type) {
      case 'clue_unlocked':
        return {
          icon: <Target className="w-5 h-5 text-[#00D1FF]" />,
          bgColor: 'bg-blue-500/10',
          borderColor: 'border-blue-500/30'
        };
      case 'buzz_used':
        return {
          icon: <Zap className="w-5 h-5 text-[#F059FF]" />,
          bgColor: 'bg-purple-500/10',
          borderColor: 'border-purple-500/30'
        };
      case 'area_unlocked':
        return {
          icon: <MapPin className="w-5 h-5 text-green-400" />,
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/30'
        };
      case 'mission_completed':
        return {
          icon: <Trophy className="w-5 h-5 text-yellow-400" />,
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/30'
        };
      default:
        return {
          icon: <Activity className="w-5 h-5 text-gray-400" />,
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/30'
        };
    }
  };

  // Format time ago
  const timeAgo = (timestamp: string) => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ora';
    if (diffMins < 60) return `${diffMins}m fa`;
    if (diffHours < 24) return `${diffHours}h fa`;
    return `${diffDays}g fa`;
  };

  return (
    <Card className={`glass-card ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#00D1FF]" />
          Diario Agente
          <Badge variant="outline" className="ml-auto text-xs">
            {entries.length} voci
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-80 px-6 pb-6">
          {loading ? (
            <div className="flex justify-center py-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 border-2 border-[#00D1FF] border-t-transparent rounded-full"
              />
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">Nessuna attività recente</p>
              <p className="text-sm text-gray-500 mt-1">
                Le tue azioni appariranno qui
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {entries.map((entry, index) => {
                  const style = getEntryStyle(entry.type);
                  
                  return (
                    <motion.div
                      key={entry.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: 20, opacity: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className={`
                        p-3 rounded-lg border ${style.bgColor} ${style.borderColor}
                        hover:bg-opacity-20 transition-all duration-200
                        cursor-pointer group
                      `}>
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className="mt-0.5">
                            {style.icon}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="font-medium text-white text-sm">
                                  {entry.title}
                                </h4>
                                <p className="text-xs text-gray-300 mt-0.5">
                                  {entry.description}
                                </p>
                              </div>
                              
                              <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                                <Clock className="w-3 h-3" />
                                {timeAgo(entry.timestamp)}
                              </div>
                            </div>

                            {/* Metadata */}
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center gap-3 text-xs">
                                {entry.location && (
                                  <div className="flex items-center gap-1 text-gray-500">
                                    <MapPin className="w-3 h-3" />
                                    <span>{entry.location}</span>
                                  </div>
                                )}
                                
                                {entry.reward && (
                                  <div className="flex items-center gap-1 text-green-400">
                                    <CheckCircle className="w-3 h-3" />
                                    <span>{entry.reward}</span>
                                  </div>
                                )}

                                {entry.metadata?.cost && (
                                  <div className="text-yellow-400">
                                    €{entry.metadata.cost}
                                  </div>
                                )}
                              </div>

                              <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-[#00D1FF] transition-colors" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default AgentDiary;