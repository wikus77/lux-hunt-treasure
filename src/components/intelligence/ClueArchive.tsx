// @ts-nocheck
// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT

import React, { useState, useEffect } from 'react';
import { Archive, Search, Calendar, Filter, Star, Lock, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ClueData {
  id: string;
  title: string;
  description: string;
  week: number;
  isLocked: boolean;
  subscriptionType: string;
  foundAt?: Date;
  importance?: 'low' | 'medium' | 'high';
}

const ClueArchive: React.FC = () => {
  const [clues, setClues] = useState<ClueData[]>([]);
  const [filteredClues, setFilteredClues] = useState<ClueData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [weekFilter, setWeekFilter] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadClues();
  }, []);

  useEffect(() => {
    filterClues();
  }, [clues, searchTerm, weekFilter, typeFilter]);

  const loadClues = async () => {
    try {
      const { data, error } = await supabase
        .from('clues')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mappedClues: ClueData[] = (data || []).map(clue => ({
        id: clue.id,
        title: clue.title,
        description: clue.description,
        week: 1, // Default week
        isLocked: clue.is_locked,
        subscriptionType: clue.premium_type || 'Base',
        foundAt: clue.created_at ? new Date(clue.created_at) : undefined,
        importance: 'medium'
      }));

      setClues(mappedClues);
    } catch (error) {
      console.error('Error loading clues:', error);
      toast({
        title: "Errore",
        description: "Impossibile caricare l'archivio indizi",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterClues = () => {
    let filtered = clues;

    if (searchTerm) {
      filtered = filtered.filter(clue =>
        clue.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        clue.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (weekFilter !== null) {
      filtered = filtered.filter(clue => clue.week === weekFilter);
    }

    if (typeFilter !== 'all') {
      filtered = filtered.filter(clue => clue.subscriptionType.toLowerCase() === typeFilter);
    }

    setFilteredClues(filtered);
  };

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case 'high':
        return <Badge variant="destructive" className="text-xs">Critico</Badge>;
      case 'medium':
        return <Badge variant="default" className="text-xs bg-yellow-500 text-white">Medio</Badge>;
      case 'low':
        return <Badge variant="secondary" className="text-xs">Basso</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">Standard</Badge>;
    }
  };

  const getSubscriptionBadge = (type: string) => {
    const colors = {
      'Base': 'bg-gray-500',
      'Silver': 'bg-gray-400',
      'Gold': 'bg-yellow-500',
      'Black': 'bg-black',
      'Premium': 'bg-purple-500'
    };
    
    return (
      <Badge className={`text-xs text-white ${colors[type as keyof typeof colors] || 'bg-gray-500'}`}>
        {type}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-primary flex items-center justify-center shadow-xl shadow-cyan-500/20">
            <Archive className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">Archivio Indizi</h3>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Eye className="w-4 h-4" />
          <span>Database completo degli indizi raccolti</span>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="border-2 border-cyan-500/20 rounded-2xl bg-card/60 backdrop-blur-md shadow-2xl shadow-cyan-500/10">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Cerca indizi... [ARCH-SEARCH]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-muted/60 border-2 border-border/50 rounded-xl py-4 backdrop-blur-md focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition-all duration-300"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={weekFilter === null ? "default" : "outline"}
                size="sm"
                onClick={() => setWeekFilter(null)}
                className="rounded-xl"
              >
                Tutte
              </Button>
              {[1, 2, 3, 4].map(week => (
                <Button
                  key={week}
                  variant={weekFilter === week ? "default" : "outline"}
                  size="sm"
                  onClick={() => setWeekFilter(week)}
                  className="rounded-xl"
                >
                  W{week}
                </Button>
              ))}
            </div>

            <div className="flex gap-2">
              {['all', 'base', 'silver', 'gold', 'black'].map(type => (
                <Button
                  key={type}
                  variant={typeFilter === type ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTypeFilter(type)}
                  className="rounded-xl capitalize"
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clues Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredClues.map((clue) => (
          <Card 
            key={clue.id} 
            className="border-2 border-cyan-500/20 rounded-2xl bg-card/60 backdrop-blur-md shadow-lg hover:shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 group cursor-pointer"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg group-hover:text-cyan-400 transition-colors">
                  {clue.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {clue.isLocked && <Lock className="w-4 h-4 text-red-400" />}
                  <Badge variant="outline" className="text-xs">
                    W{clue.week}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getSubscriptionBadge(clue.subscriptionType)}
                {getImportanceBadge(clue.importance || 'medium')}
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {clue.description}
              </p>
              
              {clue.foundAt && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  <span>
                    Trovato: {clue.foundAt.toLocaleDateString('it-IT')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredClues.length === 0 && (
        <Card className="border-2 border-dashed border-border/50 rounded-2xl bg-card/30 backdrop-blur-md">
          <CardContent className="p-12 text-center">
            <Archive className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold text-muted-foreground mb-2">
              Nessun indizio trovato
            </h3>
            <p className="text-sm text-muted-foreground">
              Modifica i filtri di ricerca per visualizzare altri indizi.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <Card className="border-2 border-cyan-500/20 rounded-2xl bg-card/60 backdrop-blur-md shadow-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-cyan-400">{clues.length}</div>
              <div className="text-sm text-muted-foreground">Totale Indizi</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-400">
                {clues.filter(c => !c.isLocked).length}
              </div>
              <div className="text-sm text-muted-foreground">Sbloccati</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-400">
                {clues.filter(c => c.importance === 'high').length}
              </div>
              <div className="text-sm text-muted-foreground">Critici</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClueArchive;