// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Target, Award, Settings, ArrowLeft, Eye, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { MissionDialog } from '@/components/admin/dialogs/MissionDialog';
import { Spinner } from '@/components/ui/spinner';
import { MissionConfig } from './MissionConfig';
import { MissionUsers } from './missions/MissionUsers';
import { MissionPrizes } from './missions/MissionPrizes';
import { getProjectRef } from '@/lib/supabase/functionsBase';

interface Mission {
  id: string;
  title: string;
  description: string | null;
  publication_date: string | null;
  status: string;
  created_at: string | null;
  updated_at: string | null;
  prize_id: string | null;
  start_date: string | null;
  end_date: string | null;
  prize_description: string | null;
  prize_value: string | null;
  prize_image_url: string | null;
}

interface MissionControlPanelProps {
  onBack: () => void;
}

const MissionControlPanel: React.FC<MissionControlPanelProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'missions' | 'users' | 'rewards'>('missions');
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentMission, setCurrentMission] = useState<Mission | null>(null);
  const [showMissionConfig, setShowMissionConfig] = useState(false);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  const [participantCounts, setParticipantCounts] = useState<Record<string, number>>({});
  const [selectedMissionIdForTabs, setSelectedMissionIdForTabs] = useState<string | null>(null);

  useEffect(() => {
    fetchMissions();
    
    // Real-time subscription for missions
    const missionsChannel = supabase
      .channel('missions-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'missions'
      }, () => {
        fetchMissions();
      })
      .subscribe();

    // Real-time subscription for participant counts
    const participantsChannel = supabase
      .channel('participants-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'mission_enrollments'
      }, () => {
        loadParticipantCounts();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(missionsChannel);
      supabase.removeChannel(participantsChannel);
    };
  }, []);

  const fetchMissions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMissions(data || []);
      
      // Load participant counts after missions are loaded
      if (data) {
        loadParticipantCounts(data);
      }
    } catch (error: any) {
      toast.error("Errore nel caricamento delle missioni", {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadParticipantCounts = async (list?: Mission[]) => {
    try {
      const counts: Record<string, number> = {};
      const listToUse = list ?? missions;
      
      for (const mission of listToUse) {
        const { count, error } = await supabase
          .from('mission_enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('mission_id', mission.id);

        if (!error) {
          counts[mission.id] = count || 0;
        }
      }
      
      setParticipantCounts(counts);
    } catch (error) {
      console.error('Error loading participant counts:', error);
    }
  };

  const handleCreateMission = async (missionData: Partial<Mission>) => {
    try {
      if (!missionData.title) {
        toast.error("Il titolo è obbligatorio");
        return;
      }

      const { data, error } = await supabase
        .from('missions')
        .insert({
          title: missionData.title,
          description: missionData.description || null,
          publication_date: missionData.publication_date || null,
          status: missionData.status || 'draft',
          start_date: missionData.start_date || null,
          end_date: missionData.end_date || null,
          prize_id: missionData.prize_id || null,
          prize_description: missionData.prize_description || null,
          prize_value: missionData.prize_value || null,
          prize_image_url: missionData.prize_image_url || null
        })
        .select()
        .single();

      if (error) throw error;
      
      // Auto-select the newly created mission
      if (data) {
        setSelectedMissionIdForTabs(data.id);
        setActiveTab('users'); // Switch to users tab
      }
      
      toast.success("Missione creata con successo");
      setIsCreateDialogOpen(false);
    } catch (error: any) {
      toast.error("Errore nella creazione della missione", {
        description: error.message
      });
    }
  };

  const handleUpdateMission = async (missionData: Partial<Mission>) => {
    if (!currentMission) return;

    try {
      if (!missionData.title) {
        toast.error("Il titolo è obbligatorio");
        return;
      }

      const { error } = await supabase
        .from('missions')
        .update({
          title: missionData.title,
          description: missionData.description,
          publication_date: missionData.publication_date,
          status: missionData.status,
          start_date: missionData.start_date,
          end_date: missionData.end_date,
          prize_id: missionData.prize_id,
          prize_description: missionData.prize_description,
          prize_value: missionData.prize_value,
          prize_image_url: missionData.prize_image_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentMission.id);

      if (error) throw error;
      toast.success("Missione aggiornata con successo");
      setIsEditDialogOpen(false);
      setCurrentMission(null);
    } catch (error: any) {
      toast.error("Errore nell'aggiornamento della missione", {
        description: error.message
      });
    }
  };

  const handleDeleteMission = async (mission: Mission) => {
    if (!confirm(`Sei sicuro di voler eliminare la missione "${mission.title}"?`)) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('missions')
        .delete()
        .eq('id', mission.id);

      if (error) throw error;
      toast.success("Missione eliminata con successo");
    } catch (error: any) {
      toast.error("Errore nell'eliminazione della missione", {
        description: error.message
      });
    }
  };

  const openEditDialog = (mission: Mission) => {
    setCurrentMission(mission);
    setIsEditDialogOpen(true);
  };

  const openMissionConfig = (mission: Mission) => {
    setSelectedMission(mission);
    setShowMissionConfig(true);
  };

  const handleMissionCardClick = (mission: Mission) => {
    setSelectedMissionIdForTabs(mission.id);
    // Auto-switch to users tab when selecting a mission
    if (activeTab === 'missions') {
      setActiveTab('users');
    }
  };

  const handleMissionUpdate = (updatedMission: Mission) => {
    setMissions(prev => prev.map(m => m.id === updatedMission.id ? updatedMission : m));
    setSelectedMission(updatedMission);
  };

  const tabs = [
    { id: 'missions', label: 'Missioni', icon: Target, color: 'text-[#4361ee]' },
    { id: 'users', label: 'Utenti', icon: Users, color: 'text-[#7209b7]' },
    { id: 'rewards', label: 'Premi', icon: Award, color: 'text-green-400' }
  ];

  // Calculate mission status badge based on dates and status
  const getMissionStatusBadge = (mission: Mission): { label: string; color: string } => {
    const now = new Date();
    const startDate = mission.start_date ? new Date(mission.start_date) : null;
    const endDate = mission.end_date ? new Date(mission.end_date) : null;

    // Completed if end date has passed
    if (endDate && now >= endDate) {
      return { label: 'Completata', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
    }

    // Live if scheduled/published and within date range
    if ((mission.status === 'scheduled' || mission.status === 'published') && 
        startDate && now >= startDate && (!endDate || now < endDate)) {
      return { label: 'Live', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
    }

    // Scheduled if status is scheduled and start date is in future
    if (mission.status === 'scheduled' && startDate && now < startDate) {
      return { label: 'Programmata', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' };
    }

    // Draft
    if (mission.status === 'draft') {
      return { label: 'Bozza', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' };
    }

    // Archived
    if (mission.status === 'archived') {
      return { label: 'Archiviata', color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
    }

    // Published (default)
    if (mission.status === 'published') {
      return { label: 'Pubblicata', color: 'bg-green-500/20 text-green-400 border-green-500/30' };
    }

    return { label: mission.status, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
  };

  const getParticipantCount = (mission: Mission) => {
    return participantCounts[mission.id] || 0;
  };

  const getCompletionPercent = (mission: Mission) => {
    // This would be calculated from actual mission progress in real app
    return mission.status === 'published' ? Math.floor(Math.random() * 100) + 1 :
           mission.status === 'draft' ? 0 : 100;
  };

  // Extract project ref from env or Supabase URL
  const getProjectRefLocal = () => {
    return getProjectRef();
  };

  // Generate Supabase table editor URL with public schema
  const supaTableUrl = (table: 'missions' | 'mission_prizes' | 'prize_categories' | 'user_mission_registrations') =>
    `https://supabase.com/dashboard/project/${getProjectRefLocal()}/database/tables/public/${table}`;

  // Calculate published/live missions count
  const getPublishedCount = () => {
    const now = new Date();
    return missions.filter(m => {
      const startDate = m.start_date ? new Date(m.start_date) : null;
      const endDate = m.end_date ? new Date(m.end_date) : null;
      
      // Count as published if:
      // - status is 'published' OR
      // - status is 'scheduled' or 'published' AND within date range (start_date <= now < end_date)
      return (
        m.status === 'published' || 
        ((m.status === 'scheduled' || m.status === 'published') && 
         startDate && now >= startDate && (!endDate || now < endDate))
      );
    }).length;
  };

  const formatDateRange = (mission: Mission) => {
    if (mission.start_date && mission.end_date) {
      const startDate = new Date(mission.start_date).toLocaleDateString('it-IT');
      const endDate = new Date(mission.end_date).toLocaleDateString('it-IT');
      return `${startDate} - ${endDate}`;
    } else if (mission.publication_date) {
      const startDate = new Date(mission.publication_date).toLocaleDateString('it-IT');
      const endDate = new Date(new Date(mission.publication_date).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('it-IT');
      return `${startDate} - ${endDate}`;
    }
    return "Date non definite";
  };

  if (showMissionConfig && selectedMission) {
    return (
      <MissionConfig
        mission={selectedMission}
        onBack={() => setShowMissionConfig(false)}
        onUpdate={handleMissionUpdate}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070818] via-[#0a0d1f] to-[#070818] p-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              onClick={onBack}
              variant="ghost"
              className="glass-card p-2 border border-white/20 hover:border-[#7209b7]/50"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-[#7209b7] to-[#4361ee] flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-orbitron font-bold text-white">
                  Mission Control
                </h1>
                <p className="text-gray-400">Centro di controllo missioni M1SSION™</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                variant="ghost"
                className={`glass-card border transition-all ${
                  activeTab === tab.id
                    ? 'border-white/40 bg-white/10'
                    : 'border-white/20 hover:border-white/30'
                }`}
              >
                <tab.icon className={`w-4 h-4 mr-2 ${tab.color}`} />
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'missions' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white">Gestione Missioni</h2>
                  <Button 
                    onClick={() => setIsCreateDialogOpen(true)}
                    className="bg-gradient-to-r from-[#4361ee] to-[#7209b7] hover:opacity-90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuova Missione
                  </Button>
                </div>
                
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <Spinner size="lg" className="text-[#4361ee]" />
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {missions.length === 0 ? (
                      <div className="glass-card p-8 border border-white/20 text-center">
                        <p className="text-gray-400">Nessuna missione disponibile</p>
                      </div>
                    ) : (
                      missions.map((mission) => (
                        <motion.div
                          key={mission.id}
                          whileHover={{ scale: 1.01 }}
                          className={`glass-card p-4 border cursor-pointer transition-colors ${
                            selectedMissionIdForTabs === mission.id 
                              ? 'border-[#4361ee] bg-[#4361ee]/10' 
                              : 'border-white/20'
                          }`}
                          onClick={() => handleMissionCardClick(mission)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#4361ee] to-[#7209b7] flex items-center justify-center">
                                <Target className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-white">{mission.title}</h3>
                                <div className="flex items-center gap-4 text-sm text-gray-400">
                                  <span>{getParticipantCount(mission)} partecipanti</span>
                                  <span>{getCompletionPercent(mission)}% completamento</span>
                                  <span>{formatDateRange(mission)}</span>
                                </div>
                                {mission.description && (
                                  <p className="text-sm text-gray-500 mt-1">{mission.description}</p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              {(() => {
                                const statusBadge = getMissionStatusBadge(mission);
                                return (
                                  <Badge className={statusBadge.color}>
                                    {statusBadge.label}
                                  </Badge>
                                );
                              })()}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openMissionConfig(mission);
                                }}
                                className="text-gray-400 hover:text-white"
                                title="Visualizza dettagli missione"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteMission(mission);
                                }}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'users' && (
              <MissionUsers selectedMissionId={selectedMissionIdForTabs} />
            )}

            {activeTab === 'rewards' && (
              <MissionPrizes selectedMissionId={selectedMissionIdForTabs} />
            )}
          </motion.div>

          {/* Stats Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-8"
          >
            <Card className="glass-card border border-white/20">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-[#4361ee]">{missions.length}</div>
                    <div className="text-sm text-gray-400">Missioni Totali</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">{getPublishedCount()}</div>
                    <div className="text-sm text-gray-400">Missioni Pubblicate</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#7209b7]">{missions.filter(m => m.status === 'draft').length}</div>
                    <div className="text-sm text-gray-400">Bozze</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{missions.filter(m => m.status === 'scheduled').length}</div>
                    <div className="text-sm text-gray-400">Programmate</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">{missions.filter(m => m.status === 'archived').length}</div>
                    <div className="text-sm text-gray-400">Archiviate</div>
                  </div>
                </div>
                <div className="mt-4 text-center space-x-2">
                  {getProjectRef() && (
                    <>
                      <Button 
                        onClick={() => window.open(supaTableUrl('missions'), '_blank', 'noopener')}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        data-testid="btn-missions-table"
                      >
                        Missions Table
                      </Button>
                      <Button 
                        onClick={() => window.open(supaTableUrl('mission_prizes'), '_blank', 'noopener')}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        data-testid="btn-mission-prizes-table"
                      >
                        Mission Prizes
                      </Button>
                      <Button 
                        onClick={() => window.open(supaTableUrl('prize_categories'), '_blank', 'noopener')}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        data-testid="btn-prize-categories-table"
                      >
                        Prize Categories
                      </Button>
                      <Button 
                        onClick={() => window.open(supaTableUrl('user_mission_registrations'), '_blank', 'noopener')}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        data-testid="btn-user-registrations-table"
                      >
                        User Registrations
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>

      {/* Mission Dialogs */}
      <MissionDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateMission}
        title="Crea Nuova Missione"
        confirmButtonText="Crea"
      />

      <MissionDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleUpdateMission}
        title="Modifica Missione"
        confirmButtonText="Salva Modifiche"
        mission={currentMission}
      />
    </div>
  );
};

export default MissionControlPanel;