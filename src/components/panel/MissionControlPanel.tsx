import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Users, Target, Award, Settings, ArrowLeft, Eye, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface MissionControlPanelProps {
  onBack: () => void;
}

const MissionControlPanel: React.FC<MissionControlPanelProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'missions' | 'users' | 'rewards'>('missions');

  // Mock data
  const missions = [
    {
      id: 1,
      title: "Missione Alpha",
      status: "active",
      participants: 127,
      completion: 65,
      startDate: "2024-01-15",
      endDate: "2024-02-15"
    },
    {
      id: 2,
      title: "Operazione Beta",
      status: "completed",
      participants: 89,
      completion: 100,
      startDate: "2023-12-01",
      endDate: "2024-01-01"
    },
    {
      id: 3,
      title: "Sfida Gamma",
      status: "draft",
      participants: 0,
      completion: 0,
      startDate: "2024-03-01",
      endDate: "2024-04-01"
    }
  ];

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
                    onClick={() => handleAction('Crea nuova missione')}
                    className="bg-gradient-to-r from-[#4361ee] to-[#7209b7] hover:opacity-90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nuova Missione
                  </Button>
                </div>
                
                <div className="grid gap-4">
                  {missions.map((mission) => (
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
                              <span>{mission.participants} partecipanti</span>
                              <span>{mission.completion}% completamento</span>
                              <span>{mission.startDate} - {mission.endDate}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(mission.status)}>
                            {mission.status}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAction('Visualizza', mission)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleAction('Elimina', mission)}
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
                    <div className="text-2xl font-bold text-green-400">{missions.filter(m => m.status === 'active').length}</div>
                    <div className="text-sm text-gray-400">Missioni Attive</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-[#7209b7]">{users.length}</div>
                    <div className="text-sm text-gray-400">Utenti Registrati</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-400">{rewards.filter(r => r.available).length}</div>
                    <div className="text-sm text-gray-400">Premi Disponibili</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">98%</div>
                    <div className="text-sm text-gray-400">Uptime Sistema</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default MissionControlPanel;