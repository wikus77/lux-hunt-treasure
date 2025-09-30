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

interface Mission {
  id: string;
  title: string;
  description: string | null;
  publication_date: string | null;
  status: string;
  created_at: string | null;
  updated_at: string | null;
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

  useEffect(() => {
    fetchMissions();
    
    // Real-time subscription
    const channel = supabase
      .channel('missions-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'missions'
      }, () => {
        fetchMissions();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
    } catch (error: any) {
      toast.error("Errore nel caricamento delle missioni", {
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMission = async (missionData: Partial<Mission>) => {
    try {
      if (!missionData.title) {
        toast.error("Il titolo è obbligatorio");
        return;
      }

      const { error } = await supabase
        .from('missions')
        .insert({
          title: missionData.title,
          description: missionData.description || null,
          publication_date: missionData.publication_date || null,
          status: missionData.status || 'draft'
        });

      if (error) throw error;
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
          ...missionData,
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

  const users = [
    {
      id: 1,
      email: "user1@example.com",
      role: "user",
      status: "active",
      joinDate: "2024-01-10",
      missions: 3
    },
    {
      id: 2,
      email: "dev@example.com",
      role: "developer",
      status: "active",
      joinDate: "2023-11-15",
      missions: 15
    },
    {
      id: 3,
      email: "admin@example.com",
      role: "admin",
      status: "active",
      joinDate: "2023-10-01",
      missions: 25
    }
  ];

  const rewards = [
    {
      id: 1,
      title: "Premio Oro",
      type: "virtual",
      value: "100 crediti",
      awarded: 12,
      available: true
    },
    {
      id: 2,
      title: "Badge Esploratore",
      type: "achievement",
      value: "Riconoscimento",
      awarded: 45,
      available: true
    },
    {
      id: 3,
      title: "Accesso VIP",
      type: "access",
      value: "30 giorni",
      awarded: 5,
      available: false
    }
  ];

  const tabs = [
    { id: 'missions', label: 'Missioni', icon: Target, color: 'text-[#4361ee]' },
    { id: 'users', label: 'Utenti', icon: Users, color: 'text-[#7209b7]' },
    { id: 'rewards', label: 'Premi', icon: Award, color: 'text-green-400' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'draft': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'developer': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'user': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const handleAction = (action: string, item?: any) => {
    toast.info(`Azione "${action}" eseguita${item ? ` per ${item.title || item.email}` : ''}`);
  };

  const getParticipantCount = (mission: Mission) => {
    // This would be calculated from user mission participation in real app
    return Math.floor(Math.random() * 200) + 50;
  };

  const getCompletionPercent = (mission: Mission) => {
    // This would be calculated from actual mission progress in real app
    return mission.status === 'published' ? Math.floor(Math.random() * 100) + 1 :
           mission.status === 'draft' ? 0 : 100;
  };

  const formatDateRange = (mission: Mission) => {
    if (!mission.publication_date) return "Data non definita";
    const startDate = new Date(mission.publication_date).toLocaleDateString('it-IT');
    // Calculate end date (example: 30 days from start)
    const endDate = new Date(new Date(mission.publication_date).getTime() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('it-IT');
    return `${startDate} - ${endDate}`;
  };

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
                          className="glass-card p-4 border border-white/20"
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
                              <Badge className={getStatusColor(mission.status)}>
                                {mission.status === 'published' ? 'Pubblicata' :
                                 mission.status === 'draft' ? 'Bozza' :
                                 mission.status === 'scheduled' ? 'Programmata' :
                                 mission.status === 'archived' ? 'Archiviata' :
                                 mission.status}
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => openEditDialog(mission)}
                                className="text-gray-400 hover:text-white"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteMission(mission)}
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
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white">Gestione Utenti</h2>
                  <Button 
                    onClick={() => handleAction('Invita utente')}
                    className="bg-gradient-to-r from-[#7209b7] to-[#4361ee] hover:opacity-90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Invita Utente
                  </Button>
                </div>
                
                <div className="grid gap-4">
                  {users.map((user) => (
                    <motion.div
                      key={user.id}
                      whileHover={{ scale: 1.01 }}
                      className="glass-card p-4 border border-white/20"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#7209b7] to-[#4361ee] flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{user.email}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span>{user.missions} missioni</span>
                              <span>Registrato: {user.joinDate}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={getRoleColor(user.role)}>
                            {user.role}
                          </Badge>
                          <Badge className={getStatusColor(user.status)}>
                            {user.status}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAction('Visualizza profilo', user)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAction('Gestisci', user)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'rewards' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-white">Gestione Premi</h2>
                  <Button 
                    onClick={() => handleAction('Crea nuovo premio')}
                    className="bg-gradient-to-r from-green-500 to-blue-600 hover:opacity-90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuovo Premio
                  </Button>
                </div>
                
                <div className="grid gap-4">
                  {rewards.map((reward) => (
                    <motion.div
                      key={reward.id}
                      whileHover={{ scale: 1.01 }}
                      className="glass-card p-4 border border-white/20"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center">
                            <Award className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{reward.title}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span>Tipo: {reward.type}</span>
                              <span>Valore: {reward.value}</span>
                              <span>Assegnati: {reward.awarded}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={reward.available ? getStatusColor('active') : getStatusColor('draft')}>
                            {reward.available ? 'Disponibile' : 'Non disponibile'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAction('Modifica', reward)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Settings className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAction('Elimina', reward)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
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
                    <div className="text-2xl font-bold text-green-400">{missions.filter(m => m.status === 'published').length}</div>
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