// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Participant {
  id: string;
  user_id: string;
  mission_id: string;
  registered_at: string;
  status: string;
  profiles?: {
    full_name?: string;
    email?: string;
  };
}

interface MissionUsersProps {
  selectedMissionId: string | null;
}

export const MissionUsers: React.FC<MissionUsersProps> = ({ selectedMissionId }) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [activeMissionId, setActiveMissionId] = useState<string | null>(null);

  // Auto-select active mission if none selected
  useEffect(() => {
    const fetchActiveMission = async () => {
      if (selectedMissionId) {
        setActiveMissionId(selectedMissionId);
        return;
      }

      try {
        const { data: missions } = await supabase
          .from('missions')
          .select('id')
          .eq('status', 'active')
          .order('start_date', { ascending: false })
          .limit(1);

        if (missions && missions.length > 0) {
          setActiveMissionId(missions[0].id);
        }
      } catch (err) {
        console.error('Error fetching active mission:', err);
      }
    };

    fetchActiveMission();
  }, [selectedMissionId]);

  useEffect(() => {
    if (!activeMissionId) return;

    fetchParticipants();

    // Real-time subscription with auto-refresh
    const channel = supabase
      .channel(`participants-realtime-${activeMissionId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'mission_enrollments',
        filter: `mission_id=eq.${activeMissionId}`
      }, (payload) => {
        console.log('📡 Mission enrollment change:', payload);
        fetchParticipants();
      })
      .subscribe((status) => {
        console.log('📡 Realtime subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeMissionId]);

  const fetchParticipants = async () => {
    if (!activeMissionId) return;

    try {
      setIsLoading(true);

      // Get enrollments with realtime-enabled query
      const { data: enrollments, error: regError, count } = await supabase
        .from('mission_enrollments')
        .select('mission_id,user_id,joined_at', { count: 'exact' })
        .eq('mission_id', activeMissionId)
        .order('joined_at', { ascending: false });

      if (regError) throw regError;

      if (!enrollments || enrollments.length === 0) {
        setParticipants([]);
        setTotalCount(0);
        return;
      }

      // Get user profiles
      const userIds = enrollments.map(r => r.user_id);
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Merge data and normalize fields
      const participantsData: Participant[] = enrollments.map((enr: any) => ({
        id: `${enr.mission_id}-${enr.user_id}`,
        user_id: enr.user_id,
        mission_id: enr.mission_id,
        registered_at: enr.joined_at,
        status: 'active',
        profiles: profiles?.find(p => p.id === enr.user_id)
      }));

      setParticipants(participantsData as any);
      setTotalCount(count || 0);
    } catch (error: any) {
      toast.error("Errore nel caricamento partecipanti", {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!activeMissionId) {
    return (
      <div className="glass-card p-8 border border-white/20 text-center">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-400">Nessuna missione attiva trovata</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Spinner size="lg" className="text-[#7209b7]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">
          Partecipanti ({totalCount})
        </h2>
      </div>

      {participants.length === 0 ? (
        <div className="glass-card p-8 border border-white/20 text-center">
          <p className="text-gray-400">Nessun partecipante registrato</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {participants.map((participant) => (
            <motion.div
              key={participant.id}
              whileHover={{ scale: 1.01 }}
              className="glass-card p-4 border border-white/20"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#7209b7] to-[#4361ee] flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">
                      {participant.profiles?.full_name || participant.profiles?.email || 'Utente'}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      {participant.profiles?.email && (
                        <span>{participant.profiles.email}</span>
                      )}
                      <span>Registrato: {formatDate(participant.registered_at)}</span>
                    </div>
                  </div>
                </div>

                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  {participant.status}
                </Badge>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
