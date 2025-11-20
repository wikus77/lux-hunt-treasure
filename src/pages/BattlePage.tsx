// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Battle Page - FASE 5: Attivazione UI Battle System

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Swords, Users, Trophy, Clock, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthContext } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Battle {
  id: string;
  status: string;
  created_at: string;
}

export default function BattlePage() {
  const { user, isAuthenticated } = useAuthContext();
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      loadBattles();
    }
  }, [isAuthenticated]);

  const loadBattles = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('battles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setBattles(data || []);
    } catch (error) {
      console.error('Error loading battles:', error);
      toast.error('Errore nel caricamento delle battle');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBattle = async () => {
    if (!isAuthenticated) {
      toast.error('Devi essere autenticato per creare una battle');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('battle-create', {
        body: { user_id: user?.id }
      });

      if (error) throw error;
      
      toast.success('Battle creata con successo!');
      loadBattles();
    } catch (error) {
      console.error('Error creating battle:', error);
      toast.error('Errore nella creazione della battle');
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-4">
            <Swords className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            M1SSION™ BATTLE
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Sfida altri agenti in battaglie strategiche. Vinci per guadagnare Pulse Energy e salire di rango!
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-purple-500/20 bg-gradient-to-br from-purple-950/20 to-transparent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Battle Attive</CardTitle>
              <Users className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">{battles.filter(b => b.status === 'active').length}</div>
            </CardContent>
          </Card>
          
          <Card className="border-pink-500/20 bg-gradient-to-br from-pink-950/20 to-transparent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">In Attesa</CardTitle>
              <Clock className="h-4 w-4 text-pink-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-pink-400">{battles.filter(b => b.status === 'pending').length}</div>
            </CardContent>
          </Card>
          
          <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-950/20 to-transparent">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completate</CardTitle>
              <Trophy className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-400">{battles.filter(b => b.status === 'completed').length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Create Battle Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleCreateBattle}
            disabled={!isAuthenticated}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold px-8 py-6 text-lg"
          >
            <Swords className="w-5 h-5 mr-2" />
            Crea Nuova Battle
          </Button>
        </div>

        {/* Battles List */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-purple-400" />
            Battle Disponibili
          </h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
              <p className="mt-4 text-muted-foreground">Caricamento battle...</p>
            </div>
          ) : battles.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <Swords className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Nessuna battle disponibile al momento</p>
                <p className="text-sm text-muted-foreground mt-2">Crea la prima battle per iniziare!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {battles.map((battle) => (
                <Card key={battle.id} className="border-purple-500/20 hover:border-purple-500/40 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Battle #{battle.id.slice(0, 8)}</span>
                      <span className={`text-sm px-3 py-1 rounded-full ${
                        battle.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        battle.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-gray-500/20 text-gray-400'
                      }`}>
                        {battle.status}
                      </span>
                    </CardTitle>
                    <CardDescription>
                      Creata il {new Date(battle.created_at).toLocaleDateString('it-IT')}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      disabled={battle.status !== 'pending'}
                    >
                      {battle.status === 'pending' ? 'Unisciti alla Battle' : 'In Corso'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-950/10 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-400" />
              Come Funziona
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>• Crea una battle o unisciti a una esistente</p>
            <p>• Sfida altri agenti in prove di abilità strategica</p>
            <p>• Vinci per guadagnare Pulse Energy e salire di rango</p>
            <p>• Le battle vengono risolte automaticamente dal sistema</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
