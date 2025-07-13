/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 * M1SSION™ Smart Prize Management System - GPS & Auto-Notifications
 */

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Gift, 
  MapPin, 
  Bell, 
  Target, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Zap
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';

interface SmartPrize {
  id: string;
  name: string;
  description: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  discoveryRadius: number; // meters
  status: 'active' | 'discovered' | 'claimed' | 'expired';
  discoveredAt?: string;
  claimedAt?: string;
  discoveredBy?: string;
  value: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  availableUntil: string;
  requirements: {
    minClues: number;
    minAreas: number;
    requiredTier?: string;
  };
  rewards: {
    credits: number;
    premiumDays?: number;
    specialBadge?: string;
  };
  autoNotificationSent: boolean;
  proximityNotificationSent: boolean;
}

interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
}

export function SmartPrizeManager() {
  const [prizes, setPrizes] = useState<SmartPrize[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [nearbyPrizes, setNearbyPrizes] = useState<SmartPrize[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationPermission, setLocationPermission] = useState<PermissionState>('prompt');
  
  const { user } = useAuthContext();
  const { addNotification } = useNotifications();
  const { toast } = useToast();

  // Calculate distance between two coordinates using Haversine formula
  const calculateDistance = useCallback((lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }, []);

  // Check if user meets prize requirements
  const checkPrizeRequirements = useCallback(async (prize: SmartPrize): Promise<boolean> => {
    if (!user) return false;

    try {
      // Fetch user stats from Supabase
      const { data: userStats } = await supabase
        .from('user_clues')
        .select('*')
        .eq('user_id', user.id);

      const { data: userAreas } = await supabase
        .from('user_map_areas')
        .select('*')
        .eq('user_id', user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_tier')
        .eq('id', user.id)
        .single();

      const cluesFound = userStats?.length || 0;
      const areasExplored = userAreas?.length || 0;
      const userTier = profile?.subscription_tier || 'free';

      const meetsRequirements = 
        cluesFound >= prize.requirements.minClues &&
        areasExplored >= prize.requirements.minAreas &&
        (!prize.requirements.requiredTier || userTier === prize.requirements.requiredTier);

      return meetsRequirements;
    } catch (error) {
      console.error('Error checking prize requirements:', error);
      return false;
    }
  }, [user]);

  // Request and track GPS location
  const requestLocationAccess = useCallback(async () => {
    if (!navigator.geolocation) {
      toast({
        title: "GPS non disponibile",
        description: "Il tuo dispositivo non supporta la geolocalizzazione",
        variant: "destructive"
      });
      return;
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      setLocationPermission(permission.state);

      if (permission.state === 'granted' || permission.state === 'prompt') {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLocation: UserLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: Date.now()
            };
            setUserLocation(newLocation);
            
            toast({
              title: "✅ GPS attivato",
              description: "Ora puoi scoprire premi nelle vicinanze!"
            });
          },
          (error) => {
            console.error('Geolocation error:', error);
            toast({
              title: "Errore GPS",
              description: "Non è stato possibile ottenere la tua posizione",
              variant: "destructive"
            });
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );

        // Watch position for continuous tracking
        navigator.geolocation.watchPosition(
          (position) => {
            const newLocation: UserLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: Date.now()
            };
            setUserLocation(newLocation);
          },
          null,
          {
            enableHighAccuracy: true,
            timeout: 30000,
            maximumAge: 60000 // 1 minute
          }
        );
      }
    } catch (error) {
      console.error('Permission check error:', error);
    }
  }, [toast]);

  // Auto-discovery system with GPS validation
  const checkPrizeProximity = useCallback(async () => {
    if (!userLocation || !user) return;

    for (const prize of prizes) {
      if (prize.status !== 'active') continue;

      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        prize.location.lat,
        prize.location.lng
      );

      // Check if user is within discovery radius
      if (distance <= prize.discoveryRadius) {
        const meetsRequirements = await checkPrizeRequirements(prize);
        
        if (meetsRequirements) {
          // Auto-discover the prize
          const updatedPrize = {
            ...prize,
            status: 'discovered' as const,
            discoveredAt: new Date().toISOString(),
            discoveredBy: user.id
          };

          // Update local state
          setPrizes(prev => prev.map(p => p.id === prize.id ? updatedPrize : p));

          // Send auto-notification
          if (!prize.autoNotificationSent) {
            addNotification({
              title: "🎉 Premio Scoperto!",
              description: `Hai scoperto "${prize.name}" nelle vicinanze!`,
              type: "success"
            });

            // Update Supabase
            await supabase
              .from('prizes')
              .update({ 
                is_active: false,
                // In a real implementation, you'd have discovered_by and discovered_at fields
              })
              .eq('id', prize.id);

            // Mark notification as sent
            updatedPrize.autoNotificationSent = true;
          }
        }
      } else if (distance <= prize.discoveryRadius * 2 && !prize.proximityNotificationSent) {
        // Proximity notification (within 2x radius)
        addNotification({
          title: "📍 Premio Vicino",
          description: `C'è un premio a ${Math.round(distance)}m da te!`,
          type: "info"
        });

        // Mark proximity notification as sent
        setPrizes(prev => prev.map(p => 
          p.id === prize.id 
            ? { ...p, proximityNotificationSent: true }
            : p
        ));
      }
    }
  }, [userLocation, prizes, user, calculateDistance, checkPrizeRequirements, addNotification]);

  // Find nearby prizes
  useEffect(() => {
    if (!userLocation) return;

    const nearby = prizes.filter(prize => {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        prize.location.lat,
        prize.location.lng
      );
      return distance <= 1000; // Within 1km
    }).sort((a, b) => {
      const distA = calculateDistance(userLocation.lat, userLocation.lng, a.location.lat, a.location.lng);
      const distB = calculateDistance(userLocation.lat, userLocation.lng, b.location.lat, b.location.lng);
      return distA - distB;
    });

    setNearbyPrizes(nearby);
  }, [userLocation, prizes, calculateDistance]);

  // Check proximity periodically
  useEffect(() => {
    const interval = setInterval(checkPrizeProximity, 30000); // Every 30 seconds
    return () => clearInterval(interval);
  }, [checkPrizeProximity]);

  // Fetch prizes from Supabase
  const fetchPrizes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('prizes')
        .select('*')
        .eq('is_active', true);

      if (error) throw error;

      // Convert Supabase data to SmartPrize format
      const smartPrizes: SmartPrize[] = (data || []).map(prize => ({
        id: prize.id,
        name: prize.name || 'Premio Misterioso',
        description: prize.description || 'Un premio speciale ti aspetta!',
        location: {
          lat: prize.lat || 0,
          lng: prize.lng || 0,
          address: prize.location_address || 'Posizione segreta'
        },
        discoveryRadius: prize.area_radius_m || 100,
        status: 'active',
        value: 100,
        difficulty: 'medium',
        availableUntil: prize.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        requirements: {
          minClues: 5,
          minAreas: 2
        },
        rewards: {
          credits: 50,
          premiumDays: 1
        },
        autoNotificationSent: false,
        proximityNotificationSent: false
      }));

      setPrizes(smartPrizes);
    } catch (error) {
      console.error('Error fetching prizes:', error);
      toast({
        title: "Errore",
        description: "Non è stato possibile caricare i premi",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrizes();
  }, []);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'hard': return 'bg-orange-500';
      case 'expert': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'discovered': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'claimed': return <Gift className="h-4 w-4 text-yellow-400" />;
      case 'expired': return <Clock className="h-4 w-4 text-red-500" />;
      default: return <Target className="h-4 w-4 text-m1ssion-blue" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* GPS Status and Control */}
      <Card className="bg-[hsl(var(--card))] border-[hsl(var(--border))]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-m1ssion-blue" />
            Sistema GPS Premi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {userLocation ? 
                  `GPS attivo • Precisione: ${userLocation.accuracy.toFixed(0)}m` :
                  'GPS non attivato'
                }
              </p>
              {nearbyPrizes.length > 0 && (
                <p className="text-sm text-m1ssion-blue mt-1">
                  {nearbyPrizes.length} premi nelle vicinanze
                </p>
              )}
            </div>
            
            {!userLocation && (
              <Button onClick={requestLocationAccess} size="sm">
                <MapPin className="h-4 w-4 mr-2" />
                Attiva GPS
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Nearby Prizes */}
      {nearbyPrizes.length > 0 && (
        <Card className="bg-[hsl(var(--card))] border-[hsl(var(--border))]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" />
              Premi Nelle Vicinanze
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {nearbyPrizes.map(prize => {
                const distance = userLocation ? calculateDistance(
                  userLocation.lat, userLocation.lng,
                  prize.location.lat, prize.location.lng
                ) : 0;

                return (
                  <div key={prize.id} className="flex items-center justify-between p-3 border border-[hsl(var(--border))] rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(prize.status)}
                      <div>
                        <p className="font-medium text-[hsl(var(--foreground))]">{prize.name}</p>
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                          {Math.round(distance)}m • {prize.location.address}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getDifficultyColor(prize.difficulty)}>
                        {prize.difficulty}
                      </Badge>
                      <Badge variant="outline">
                        {prize.rewards.credits} crediti
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Prizes List */}
      <Card className="bg-[hsl(var(--card))] border-[hsl(var(--border))]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-yellow-400" />
            Gestione Premi Intelligente
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-m1ssion-blue"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {prizes.map(prize => (
                <div key={prize.id} className="p-4 border border-[hsl(var(--border))] rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-[hsl(var(--foreground))]">{prize.name}</h3>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">{prize.description}</p>
                    </div>
                    {getStatusIcon(prize.status)}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-[hsl(var(--muted-foreground))]">
                    <span>📍 {prize.location.address}</span>
                    <span>🎯 {prize.discoveryRadius}m radius</span>
                    <Badge className={getDifficultyColor(prize.difficulty)}>
                      {prize.difficulty}
                    </Badge>
                  </div>
                  
                  <div className="mt-3 p-2 bg-[hsl(var(--muted))]/50 rounded">
                    <p className="text-sm">
                      <strong>Requisiti:</strong> {prize.requirements.minClues} indizi, {prize.requirements.minAreas} aree
                    </p>
                    <p className="text-sm">
                      <strong>Ricompense:</strong> {prize.rewards.credits} crediti
                      {prize.rewards.premiumDays && `, ${prize.rewards.premiumDays} giorni premium`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/*
 * 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
 */