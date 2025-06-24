
import React, { useState } from 'react';
import { useAuthContext } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Crown, Users, Gift, RefreshCw, Shield } from 'lucide-react';
import AdminPrizeManager from './prizeManager/AdminPrizeManager';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuthContext();
  const [isResetting, setIsResetting] = useState(false);
  const [activeUsers, setActiveUsers] = useState(0);

  // CRITICAL FIX: Weekly reset functionality
  const handleWeeklyReset = async () => {
    if (!confirm('Sei sicuro di voler resettare i dati settimanali? Questa operazione è irreversibile.')) {
      return;
    }

    setIsResetting(true);
    try {
      // Reset user buzz counters
      const { error: buzzError } = await supabase
        .from('user_buzz_counter')
        .update({ buzz_count: 0, week_map_generations: [0, 0, 0, 0] })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (buzzError) throw buzzError;

      // Reset map counters
      const { error: mapError } = await supabase
        .from('user_buzz_map_counter')
        .update({ buzz_map_count: 0, week_map_counts: [0, 0, 0, 0, 0, 0, 0] })
        .neq('id', '00000000-0000-0000-0000-000000000000');

      if (mapError) throw mapError;

      toast.success('Reset settimanale completato con successo');
      
    } catch (error) {
      console.error('❌ Error during weekly reset:', error);
      toast.error('Errore durante il reset settimanale');
    } finally {
      setIsResetting(false);
    }
  };

  // CRITICAL FIX: Load active users count
  const loadActiveUsers = async () => {
    try {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .not('last_sign_in_at', 'is', null);

      if (error) throw error;
      setActiveUsers(count || 0);
      
    } catch (error) {
      console.error('❌ Error loading active users:', error);
    }
  };

  React.useEffect(() => {
    loadActiveUsers();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Crown className="h-8 w-8 text-yellow-500" />
        <h1 className="text-3xl font-bold text-white">
          Admin Dashboard M1SSION™
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-black/40 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-blue-400" />
            <div>
              <div className="text-2xl font-bold text-white">{activeUsers}</div>
              <div className="text-sm text-gray-400">Utenti Attivi</div>
            </div>
          </div>
        </div>

        <div className="bg-black/40 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <Gift className="h-6 w-6 text-green-400" />
            <div>
              <div className="text-2xl font-bold text-white">4</div>
              <div className="text-sm text-gray-400">Premi Attivi</div>
            </div>
          </div>
        </div>

        <div className="bg-black/40 rounded-lg p-4 border border-white/10">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-red-400" />
            <div>
              <div className="text-2xl font-bold text-white">Sicuro</div>
              <div className="text-sm text-gray-400">Sistema Status</div>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="prizes" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-black/40">
          <TabsTrigger value="prizes" className="data-[state=active]:bg-[#00D1FF]/20">
            Gestione Premi
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-[#00D1FF]/20">
            Utenti
          </TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-[#00D1FF]/20">
            Sistema
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prizes">
          <AdminPrizeManager />
        </TabsContent>

        <TabsContent value="users">
          <div className="bg-black/40 rounded-lg p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">
              Gestione Utenti
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-black/20 rounded-lg">
                <div>
                  <div className="font-semibold text-white">Utenti Registrati</div>
                  <div className="text-sm text-gray-400">Totale utenti nel sistema</div>
                </div>
                <div className="text-2xl font-bold text-[#00D1FF]">{activeUsers}</div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="system">
          <div className="bg-black/40 rounded-lg p-6 border border-white/10">
            <h3 className="text-xl font-bold text-white mb-4">
              Controlli di Sistema
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <h4 className="font-semibold text-yellow-400 mb-2">
                  Reset Settimanale
                </h4>
                <p className="text-sm text-gray-300 mb-4">
                  Resetta tutti i contatori BUZZ e le generazioni mappa per una nuova settimana.
                </p>
                <Button
                  onClick={handleWeeklyReset}
                  disabled={isResetting}
                  variant="destructive"
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  {isResetting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Resettando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Reset Settimanale
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
