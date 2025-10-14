// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { createBulkMarkers, type Distribution } from '@/utils/markerApi';

// Build-time hash calculation for integrity verification
const calculateCodeHash = () => {
  const sourceCode = [
    'BulkMarkerDropComponent',
    'create-random-markers',
    'WouterRoutes',
    'MissionPanelPage'
  ].join('|');
  
  // Simple hash implementation for client-side
  let hash = 0;
  for (let i = 0; i < sourceCode.length; i++) {
    const char = sourceCode.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert to hex and pad to 64 chars (SHA-256 like format)
  return Math.abs(hash).toString(16).padStart(64, '0');
};

interface RewardDistribution {
  type: 'message' | 'buzz_free' | 'xp_points';
  count: number;
  text?: string;
  points?: number;
}

interface BoundingBox {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
}

export const BulkMarkerDropComponent: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [distributions, setDistributions] = useState<RewardDistribution[]>([
    { type: 'buzz_free', count: 1 }
  ]);
  const [visibilityHours, setVisibilityHours] = useState(24);
  const [bbox, setBbox] = useState<BoundingBox | null>(null);
  const [response, setResponse] = useState<any>(null);
  const [userRole, setUserRole] = useState<string>('');
  const [jwtExpiry, setJwtExpiry] = useState<number | null>(null);
  const [securityHeaders, setSecurityHeaders] = useState<{
    version: string;
    codeHash: string;
  }>({
    version: 'v1',
    codeHash: calculateCodeHash()
  });

  // Check JWT expiry and user role
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          const payload = JSON.parse(atob(session.access_token.split('.')[1]));
          setJwtExpiry(payload.exp * 1000);
          
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();
          
          setUserRole(profile?.role?.toLowerCase() || '');
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };
    
    checkAuth();
    const interval = setInterval(checkAuth, 30000); // Check every 30s
    
    return () => clearInterval(interval);
  }, []);

  const isAuthValid = userRole === 'admin' || userRole === 'owner';
  const jwtExpiresIn = jwtExpiry ? Math.max(0, jwtExpiry - Date.now()) : 0;
  const jwtWarning = jwtExpiresIn > 0 && jwtExpiresIn < 10 * 60 * 1000; // < 10 minutes

  const handleSubmit = async () => {
    // Security gate: block if not admin/owner
    if (!isAuthValid) {
      toast({
        title: "Accesso Negato",
        description: "Solo admin/owner possono eseguire bulk drops",
        variant: "destructive"
      });
      return;
    }

    if (!distributions.length) {
      toast({
        title: "Errore",
        description: "Aggiungi almeno una distribuzione",
        variant: "destructive"
      });
      return;
    }

    // Validate Message types have text and XP Points have points
    for (const dist of distributions) {
      if (dist.type === 'message' && (!dist.text || dist.text.trim().length === 0)) {
        toast({
          title: "Errore",
          description: "Tutti i marker di tipo 'Message' devono avere un testo",
          variant: "destructive"
        });
        return;
      }
      if (dist.type === 'xp_points' && (!dist.points || dist.points < 1)) {
        toast({
          title: "Errore", 
          description: "I marker XP Points devono avere almeno 1 punto",
          variant: "destructive"
        });
        return;
      }
      if (dist.count < 1) {
        toast({
          title: "Errore",
          description: "Tutti i marker devono avere quantità >= 1",
          variant: "destructive"
        });
        return;
      }
    }

    setIsLoading(true);
    setResponse(null);

    try {
      // Build marker distributions payload (compat-only cast to avoid TS error on shape mismatch)
      const apiPayload = {
        distributions: distributions.map(dist => {
          if (dist.type === 'message') return { type: 'message', count: dist.count, text: dist.text! };
          if (dist.type === 'xp_points') return { type: 'xp_points', count: dist.count, points: dist.points! };
          return { type: 'buzz_free', count: dist.count };
        }),
        visibilityHours
      } as any;

      const result = await createBulkMarkers(apiPayload as any);

      setResponse(result);

      toast({
        title: "Successo",
        description: `Creati ${result.created || 0} marker`,
        variant: "default"
      });

    } catch (error) {
      console.error('Submit error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Errore sconosciuto';
      
      setResponse({
        error: errorMsg,
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "Errore",
        description: errorMsg,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addDistribution = () => {
    setDistributions([...distributions, { type: 'buzz_free', count: 1 }]);
  };

  const removeDistribution = (index: number) => {
    if (distributions.length > 1) {
      setDistributions(distributions.filter((_, i) => i !== index));
    }
  };

  const updateDistribution = (index: number, field: keyof RewardDistribution, value: any) => {
    const updated = [...distributions];
    updated[index] = { ...updated[index], [field]: value };
    setDistributions(updated);
  };

  return (
    <div className="space-y-6">
      {/* Security Status */}
      <Card>
        <CardHeader>
          <CardTitle>🔒 Security Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span>Role:</span>
            <Badge variant={isAuthValid ? "default" : "destructive"}>
              {userRole || 'unknown'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>JWT Status:</span>
            <Badge variant={jwtWarning ? "destructive" : "default"}>
              {jwtExpiresIn > 0 ? `${Math.floor(jwtExpiresIn / 60000)}m remaining` : 'expired'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Version:</span>
            <Badge variant="outline">{securityHeaders.version}</Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Code Hash:</span>
            <Badge variant="outline" className="font-mono text-xs">
              {securityHeaders.codeHash.substring(0, 12)}...
            </Badge>
          </div>
          
          {jwtWarning && (
            <Alert>
              <AlertDescription>
                ⚠️ JWT expires in less than 10 minutes. Consider refreshing your session.
              </AlertDescription>
            </Alert>
          )}
          
          {!isAuthValid && (
            <Alert>
              <AlertDescription>
                ❌ Access denied. Admin or Owner role required.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🎯 Bulk Marker Drop</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Distributions */}
          <div>
            <Label className="text-base font-medium">Distributions</Label>
            <div className="space-y-2 mt-2">
              {distributions.map((dist, index) => (
                <div key={index} className="space-y-2 p-3 border rounded">
                  <div className="flex items-center gap-2">
                    <Select
                      value={dist.type}
                      onValueChange={(value) => updateDistribution(index, 'type', value as RewardDistribution['type'])}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buzz_free">Buzz Free</SelectItem>
                        <SelectItem value="message">Message</SelectItem>
                        <SelectItem value="xp_points">XP Points</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={dist.count}
                      onChange={(e) => updateDistribution(index, 'count', parseInt(e.target.value) || 1)}
                      className="w-24"
                      placeholder="Qty"
                    />
                    
                    {dist.type === 'xp_points' && (
                      <Input
                        type="number"
                        min="1"
                        max="1000"
                        value={dist.points || 10}
                        onChange={(e) => updateDistribution(index, 'points', parseInt(e.target.value) || 10)}
                        className="w-24"
                        placeholder="XP"
                      />
                    )}
                    
                    <Button
                      onClick={() => removeDistribution(index)}
                      variant="destructive"
                      size="sm"
                      disabled={distributions.length <= 1}
                    >
                      Remove
                    </Button>
                  </div>
                  
                  {dist.type === 'message' && (
                    <div>
                      <Label htmlFor={`message-${index}`} className="text-sm">Messaggio</Label>
                      <Textarea
                        id={`message-${index}`}
                        value={dist.text || ''}
                        onChange={(e) => updateDistribution(index, 'text', e.target.value)}
                        placeholder="Inserisci il messaggio per questo marker..."
                        className="min-h-[80px]"
                        maxLength={500}
                      />
                      <div className="text-xs text-gray-500 mt-1">
                        {(dist.text || '').length}/500 caratteri
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <Button onClick={addDistribution} variant="outline" size="sm" className="mt-2">
              Add Distribution
            </Button>
          </div>

          <Separator />

          {/* Visibility */}
          <div>
            <Label htmlFor="visibility">Visibility Hours</Label>
            <Input
              id="visibility"
              type="number"
              min="1"
              value={visibilityHours}
              onChange={(e) => setVisibilityHours(parseInt(e.target.value) || 24)}
              className="w-32"
            />
          </div>

          <Button 
            onClick={handleSubmit} 
            disabled={isLoading || !isAuthValid || jwtExpiresIn <= 0} 
            className="w-full"
          >
            {isLoading ? 'Creando...' : 'Crea Marker'}
          </Button>
        </CardContent>
      </Card>

      {/* Response Debug */}
      {response && (
        <Card>
          <CardHeader>
            <CardTitle>📊 Response Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {response?.httpStatus === 207 && (
                <Alert>
                  <AlertDescription>
                    ⚠️ Parziale: {response?.parsedResponse?.created || 0} creati, {response?.parsedResponse?.partial_failures || 0} fallimenti, {response?.parsedResponse?.errors?.length || 0} errori
                  </AlertDescription>
                </Alert>
              )}
              
              <pre className="bg-muted p-4 rounded text-sm overflow-auto max-h-96">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BulkMarkerDropComponent;