// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT
// Visualizzatore indizi M1SSION™ con filtri avanzati

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Search, 
  Filter, 
  Eye, 
  Calendar, 
  Star, 
  AlertTriangle,
  Clock,
  Target
} from 'lucide-react';
import { useMissionClues, MissionClue } from '@/hooks/useMissionClues';

interface ClueViewerProps {
  missionId: string;
  userTier?: string;
  currentWeek?: number;
  adminMode?: boolean;
}

const ClueViewer: React.FC<ClueViewerProps> = ({ 
  missionId, 
  userTier = 'base',
  currentWeek = 1,
  adminMode = false 
}) => {
  const { 
    clues, 
    isLoading, 
    loadCluesForMission, 
    getAvailableCluesForUser,
    getCluePreviewByTier,
    TIER_WEEKLY_LIMITS
  } = useMissionClues();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterWeek, setFilterWeek] = useState<string>('all');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    if (missionId) {
      loadCluesForMission(missionId);
    }
  }, [missionId]);

  // Filtra indizi basato su criteri
  const filteredClues = clues.filter(clue => {
    const matchesSearch = clue.description_it.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         clue.title_it.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesWeek = filterWeek === 'all' || clue.week.toString() === filterWeek;
    const matchesTier = filterTier === 'all' || clue.tier === filterTier;
    const matchesType = filterType === 'all' || clue.clue_type === filterType;
    
    return matchesSearch && matchesWeek && matchesTier && matchesType;
  });

  // Indizi disponibili per l'utente (non admin)
  const userAvailableClues = adminMode ? filteredClues : getAvailableCluesForUser(userTier, currentWeek);
  const displayClues = adminMode ? filteredClues : userAvailableClues;

  const TierBadge = ({ tier }: { tier: string }) => {
    const colors = {
      base: 'bg-gray-500 text-white',
      silver: 'bg-gray-400 text-black',
      gold: 'bg-yellow-500 text-black',
      black: 'bg-black text-white',
      titanium: 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
    };

    return (
      <Badge className={colors[tier as keyof typeof colors] || 'bg-gray-300'}>
        {tier.toUpperCase()}
      </Badge>
    );
  };

  const WeekBadge = ({ week }: { week: number }) => {
    const themes = {
      1: { color: 'bg-blue-500', label: 'Simbolico' },
      2: { color: 'bg-green-500', label: 'Geografia' },
      3: { color: 'bg-yellow-500', label: 'Microzona' },
      4: { color: 'bg-red-500', label: 'Coordinate' }
    };
    
    const theme = themes[week as keyof typeof themes] || { color: 'bg-gray-500', label: 'Unknown' };
    
    return (
      <Badge className={`${theme.color} text-white`}>
        W{week} - {theme.label}
      </Badge>
    );
  };

  const ClueCard = ({ clue }: { clue: MissionClue }) => (
    <Card className={`transition-all hover:shadow-md ${clue.clue_type === 'decoy' ? 'border-orange-300 bg-orange-50/50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm font-medium line-clamp-1">
            {clue.title_it}
          </CardTitle>
          <div className="flex items-center gap-1">
            {clue.clue_type === 'decoy' && (
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            )}
            <Star className={`h-4 w-4 ${clue.difficulty_level >= 4 ? 'text-red-500' : clue.difficulty_level >= 3 ? 'text-yellow-500' : 'text-green-500'}`} />
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          <WeekBadge week={clue.week} />
          <TierBadge tier={clue.tier} />
          {clue.clue_type === 'decoy' && (
            <Badge variant="outline" className="text-orange-600">
              DECOY
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-2">
          {clue.description_it}
        </p>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Categoria: {clue.category}</span>
          <span>Difficoltà: {clue.difficulty_level}/5</span>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Clock className="h-5 w-5 animate-spin" />
            <span>Caricamento indizi M1SSION™...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header con info accesso */}
      <Card className="border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Indizi M1SSION™
              {!adminMode && (
                <Badge variant="outline">
                  {userTier.toUpperCase()} - Max {TIER_WEEKLY_LIMITS[userTier as keyof typeof TIER_WEEKLY_LIMITS]}/week
                </Badge>
              )}
            </CardTitle>
            <Badge variant="outline">
              {displayClues.length} indizi disponibili
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Filtri */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtri Avanzati
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cerca</label>
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cerca negli indizi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Settimana</label>
              <Select value={filterWeek} onValueChange={setFilterWeek}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutte le settimane</SelectItem>
                  <SelectItem value="1">Settimana 1 - Simbolico</SelectItem>
                  <SelectItem value="2">Settimana 2 - Geografia</SelectItem>
                  <SelectItem value="3">Settimana 3 - Microzona</SelectItem>
                  <SelectItem value="4">Settimana 4 - Coordinate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tier</label>
              <Select value={filterTier} onValueChange={setFilterTier}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i tier</SelectItem>
                  <SelectItem value="base">Base</SelectItem>
                  <SelectItem value="silver">Silver</SelectItem>
                  <SelectItem value="gold">Gold</SelectItem>
                  <SelectItem value="black">Black</SelectItem>
                  <SelectItem value="titanium">Titanium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tipo</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i tipi</SelectItem>
                  <SelectItem value="real">Reali</SelectItem>
                  <SelectItem value="decoy">Decoy (Falsi)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vista indizi */}
      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="grid">Vista Griglia</TabsTrigger>
          <TabsTrigger value="list">Vista Lista</TabsTrigger>
        </TabsList>
        
        <TabsContent value="grid" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayClues.map((clue) => (
              <ClueCard key={clue.id} clue={clue} />
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="list" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-3">
              {displayClues.map((clue) => (
                <ClueCard key={clue.id} clue={clue} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {displayClues.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nessun indizio trovato</h3>
            <p className="text-muted-foreground">
              {clues.length === 0 
                ? 'Non sono ancora stati generati indizi per questa missione.'
                : 'Nessun indizio corrisponde ai filtri selezionati.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ClueViewer;