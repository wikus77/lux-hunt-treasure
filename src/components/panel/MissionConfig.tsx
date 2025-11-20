// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Calendar, Award, Edit, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Spinner } from '@/components/ui/spinner';

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

interface MissionConfigProps {
  mission: Mission;
  onBack: () => void;
  onUpdate: (mission: Mission) => void;
}

export const MissionConfig: React.FC<MissionConfigProps> = ({ mission, onBack, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [participantCount, setParticipantCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [editData, setEditData] = useState<Mission>(mission);

  useEffect(() => {
    loadParticipantCount();
    
    // Real-time subscription for participant count
    const channel = supabase
      .channel('mission-participants')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_mission_registrations',
        filter: `mission_id=eq.${mission.id}`
      }, () => {
        loadParticipantCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [mission.id]);

  const loadParticipantCount = async () => {
    try {
      setIsLoading(true);
      const { count, error } = await supabase
        .from('user_mission_registrations')
        .select('*', { count: 'exact', head: true })
        .eq('mission_id', mission.id)
        .eq('status', 'active');

      if (error) throw error;
      setParticipantCount(count || 0);
    } catch (error: any) {
      console.error('Error loading participant count:', error);
      toast.error("Errore nel caricamento dei partecipanti");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('missions')
        .update({
          title: editData.title,
          description: editData.description,
          status: editData.status,
          start_date: editData.start_date,
          end_date: editData.end_date,
          // Prize fields removed - managed only in Prizes tab
          updated_at: new Date().toISOString()
        })
        .eq('id', mission.id);

      if (error) throw error;
      
      toast.success("Missione aggiornata con successo");
      onUpdate(editData);
      setIsEditing(false);
    } catch (error: any) {
      toast.error("Errore nell'aggiornamento della missione", {
        description: error.message
      });
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Non definita";
    return new Date(dateString).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'completed': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'draft': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'published': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'scheduled': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'archived': return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published': return 'Pubblicata';
      case 'draft': return 'Bozza';
      case 'scheduled': return 'Programmata';
      case 'archived': return 'Archiviata';
      case 'active': return 'Attiva';
      case 'completed': return 'Completata';
      default: return status;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#070818] via-[#0a0d1f] to-[#070818] p-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                onClick={onBack}
                variant="ghost"
                className="glass-card p-2 border border-white/20 hover:border-[#7209b7]/50"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </Button>
              
              <div>
                <h1 className="text-2xl font-orbitron font-bold text-white">
                  Mission Config
                </h1>
                <p className="text-gray-400">Configurazione dettagli missione</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button
                    onClick={handleSave}
                    className="bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salva
                  </Button>
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      setEditData(mission);
                    }}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Annulla
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="bg-gradient-to-r from-[#4361ee] to-[#7209b7] hover:opacity-90"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Modifica
                </Button>
              )}
            </div>
          </div>

          {/* Mission Overview */}
          <div className="grid gap-6 mb-8">
            <Card className="glass-card border-white/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#4361ee]" />
                    Informazioni Missione
                  </CardTitle>
                  <Badge className={getStatusColor(isEditing ? editData.status : mission.status)}>
                    {getStatusLabel(isEditing ? editData.status : mission.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Titolo</Label>
                    {isEditing ? (
                      <Input
                        value={editData.title}
                        onChange={(e) => setEditData({...editData, title: e.target.value})}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-white text-lg font-semibold">{mission.title}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-gray-300">Partecipanti</Label>
                    <div className="flex items-center gap-2 mt-1">
                      {isLoading ? (
                        <Spinner size="sm" />
                      ) : (
                        <span className="text-white text-lg font-semibold">{participantCount}</span>
                      )}
                      <Users className="w-4 h-4 text-[#4361ee]" />
                    </div>
                  </div>
                </div>
                
                <div>
                  <Label className="text-gray-300">Descrizione</Label>
                  {isEditing ? (
                    <Textarea
                      value={editData.description || ""}
                      onChange={(e) => setEditData({...editData, description: e.target.value})}
                      className="mt-1"
                      rows={3}
                    />
                  ) : (
                    <p className="text-gray-400 mt-1">{mission.description || "Nessuna descrizione"}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Dates */}
            <Card className="glass-card border-white/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#4361ee]" />
                  Date e Programmazione
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Data Inizio</Label>
                    {isEditing ? (
                      <Input
                        type="datetime-local"
                        value={editData.start_date ? new Date(editData.start_date).toISOString().slice(0, 16) : ""}
                        onChange={(e) => setEditData({
                          ...editData, 
                          start_date: e.target.value ? new Date(e.target.value).toISOString() : null
                        })}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-white">{formatDate(mission.start_date)}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label className="text-gray-300">Data Fine</Label>
                    {isEditing ? (
                      <Input
                        type="datetime-local"
                        value={editData.end_date ? new Date(editData.end_date).toISOString().slice(0, 16) : ""}
                        onChange={(e) => setEditData({
                          ...editData, 
                          end_date: e.target.value ? new Date(e.target.value).toISOString() : null
                        })}
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-white">{formatDate(mission.end_date)}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <Label className="text-gray-300">Data Pubblicazione</Label>
                  <p className="text-white">{formatDate(mission.publication_date)}</p>
                </div>
              </CardContent>
            </Card>

            {/* Prize Details - Read Only */}
            <Card className="glass-card border-white/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-[#4361ee]" />
                    Dettagli Premio (Solo Lettura)
                  </CardTitle>
                  <Button
                    onClick={() => {
                      // Navigate back and parent will handle switching to prizes tab
                      onBack();
                    }}
                    variant="outline"
                    size="sm"
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    Gestisci Premi
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Descrizione Premio</Label>
                    <p className="text-white">{mission.prize_description || "Nessun premio definito"}</p>
                    <p className="text-xs text-gray-500 mt-1">I premi vengono gestiti dal tab Premi nel Mission Control</p>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300">Valore Premio</Label>
                    <p className="text-white">{mission.prize_value || "Non specificato"}</p>
                  </div>
                </div>
                
                {mission.prize_image_url && (
                  <div>
                    <Label className="text-gray-300">Immagine Premio</Label>
                    <div className="mt-2">
                      <img 
                        src={mission.prize_image_url} 
                        alt="Premio" 
                        className="w-32 h-32 object-cover rounded-lg border border-white/20"
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
};