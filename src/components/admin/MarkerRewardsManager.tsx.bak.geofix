// © 2025 Joseph MULÉ – M1SSION™

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MarkerReward {
  id?: string;
  marker_id: string;
  reward_type: string;
  payload: any;
  description: string;
}

interface MarkerRewardsManagerProps {
  onRewardAdded?: () => void;
}

const MarkerRewardsManager: React.FC<MarkerRewardsManagerProps> = ({ onRewardAdded }) => {
  const [markerId, setMarkerId] = useState('');
  const [rewardType, setRewardType] = useState<string>('');
  const [description, setDescription] = useState('');
  const [payload, setPayload] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleRewardTypeChange = (type: string) => {
    setRewardType(type);
    // Set default payload based on type
    switch (type) {
      case 'buzz_free':
        setPayload({ buzzCount: 1 });
        break;
      case 'message':
        setPayload({ text: 'Congratulazioni agente!' });
        break;
      case 'xp_points':
        setPayload({ xp: 50 });
        break;
      case 'event_ticket':
        setPayload({ event_id: '', ticket_type: 'standard' });
        break;
      case 'badge':
        setPayload({ badge_id: '' });
        break;
      default:
        setPayload({});
    }
  };

  const updatePayload = (key: string, value: any) => {
    setPayload(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!markerId || !rewardType) {
      toast.error('Marker ID e tipo ricompensa sono obbligatori');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('marker_rewards')
        .insert([{
          marker_id: markerId,
          reward_type: rewardType,
          payload,
          description: description || `Premio ${rewardType}`
        }]);

      if (error) throw error;

      toast.success('Ricompensa aggiunta con successo!');
      
      // Reset form
      setMarkerId('');
      setRewardType('');
      setDescription('');
      setPayload({});
      
      onRewardAdded?.();
    } catch (error) {
      console.error('Error adding reward:', error);
      toast.error('Errore nell\'aggiunta della ricompensa');
    } finally {
      setIsLoading(false);
    }
  };

  const renderPayloadFields = () => {
    switch (rewardType) {
      case 'buzz_free':
        return (
          <div>
            <Label htmlFor="buzzCount">Numero BUZZ gratuiti</Label>
            <Input
              id="buzzCount"
              type="number"
              min="1"
              value={payload.buzzCount || 1}
              onChange={(e) => updatePayload('buzzCount', parseInt(e.target.value))}
            />
          </div>
        );
      
      case 'message':
        return (
          <div>
            <Label htmlFor="messageText">Messaggio</Label>
            <Textarea
              id="messageText"
              value={payload.text || ''}
              onChange={(e) => updatePayload('text', e.target.value)}
              placeholder="Messaggio da inviare all'utente"
            />
          </div>
        );
      
      case 'xp_points':
        return (
          <div>
            <Label htmlFor="xpPoints">Punti XP</Label>
            <Input
              id="xpPoints"
              type="number"
              min="1"
              value={payload.xp || 50}
              onChange={(e) => updatePayload('xp', parseInt(e.target.value))}
            />
          </div>
        );
      
      case 'event_ticket':
        return (
          <div className="space-y-3">
            <div>
              <Label htmlFor="eventId">Event ID</Label>
              <Input
                id="eventId"
                value={payload.event_id || ''}
                onChange={(e) => updatePayload('event_id', e.target.value)}
                placeholder="UUID dell'evento"
              />
            </div>
            <div>
              <Label htmlFor="ticketType">Tipo Ticket</Label>
              <Select value={payload.ticket_type || 'standard'} onValueChange={(value) => updatePayload('ticket_type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      
      case 'badge':
        return (
          <div>
            <Label htmlFor="badgeId">Badge ID</Label>
            <Input
              id="badgeId"
              value={payload.badge_id || ''}
              onChange={(e) => updatePayload('badge_id', e.target.value)}
              placeholder="UUID del badge"
            />
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>🎁 Salva Ricompense Marker</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="markerId">Marker ID</Label>
            <Input
              id="markerId"
              value={markerId}
              onChange={(e) => setMarkerId(e.target.value)}
              placeholder="UUID del marker (es. QR code ID)"
              required
            />
          </div>

          <div>
            <Label htmlFor="rewardType">Tipo Ricompensa</Label>
            <Select value={rewardType} onValueChange={handleRewardTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona tipo ricompensa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buzz_free">⚡ BUZZ Gratuiti</SelectItem>
                <SelectItem value="message">📩 Messaggio</SelectItem>
                <SelectItem value="xp_points">🏆 Punti XP</SelectItem>
                <SelectItem value="event_ticket">🎫 Ticket Evento</SelectItem>
                <SelectItem value="badge">🏅 Badge</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {rewardType && renderPayloadFields()}

          <div>
            <Label htmlFor="description">Descrizione (opzionale)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrizione breve per il popup"
            />
          </div>

          <Button 
            type="submit" 
            disabled={isLoading || !markerId || !rewardType}
            className="w-full"
          >
            {isLoading ? 'Salvando...' : 'Salva Ricompense Marker'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default MarkerRewardsManager;