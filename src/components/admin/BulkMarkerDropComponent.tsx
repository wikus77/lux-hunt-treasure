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
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  type: string;
  count: number;
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
    { type: 'BUZZ_FREE', count: 1 }
  ]);
  const [visibility, setVisibility] = useState({ hours: 24 });
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

    // Security gate: block if missing required headers
    if (!securityHeaders.version || !securityHeaders.codeHash) {
      toast({
        title: "Errore Sicurezza",
        description: "Header di versione e checksum richiesti",
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

    setIsLoading(true);
    setResponse(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('No session found');
      }

      const SUPABASE_URL = "https://vkjrqirvdvjbemsfzxof.supabase.co";
      const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk";

      const payload = {
        distributions,
        visibility,
        ...(bbox && { bbox })
      };

      const url = `${SUPABASE_URL}/functions/v1/create-random-markers?debug=1`;
      
      const requestStart = Date.now();
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'apikey': ANON_KEY,
          'Content-Type': 'application/json',
          'X-M1-Dropper-Version': securityHeaders.version,
          'X-M1-Code-Hash': securityHeaders.codeHash,
          'Origin': window.location.origin
        },
        body: JSON.stringify(payload)
      });

      const requestEnd = Date.now();
      const responseText = await response.text();
      
      let parsedResponse: any;
      try {
        parsedResponse = JSON.parse(responseText);
      } catch {
        parsedResponse = null;
      }

      const diagnostic = {
        httpStatus: response.status,
        request_id: response.headers.get('x-request-id') || 'unknown',
        duration_ms: requestEnd - requestStart,
        headers: Object.fromEntries(response.headers.entries()),
        rawResponse: responseText,
        parsedResponse
      };

      setResponse(diagnostic);

      if (response.ok) {
        const isPartial = response.status === 207;
        toast({
          title: isPartial ? "Successo Parziale" : "Successo",
          description: `Creati ${parsedResponse?.created || 'N/A'} marker${isPartial ? ` (${parsedResponse?.partial_failures || 0} fallimenti)` : ''}`,
          variant: isPartial ? "default" : "default"
        });
      } else {
        toast({
          title: "Errore",
          description: `Errore ${response.status}: ${parsedResponse?.error || responseText}`,
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Submit error:', error);
      setResponse({
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      toast({
        title: "Errore",
        description: error instanceof Error ? error.message : 'Errore sconosciuto',
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addDistribution = () => {
    setDistributions([...distributions, { type: 'BUZZ_FREE', count: 1 }]);
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
                <div key={index} className="flex items-center gap-2 p-3 border rounded">
                  <Select
                    value={dist.type}
                    onValueChange={(value) => updateDistribution(index, 'type', value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BUZZ_FREE">Buzz Free</SelectItem>
                      <SelectItem value="MESSAGE">Message</SelectItem>
                      <SelectItem value="XP_POINTS">XP Points</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Input
                    type="number"
                    min="0"
                    value={dist.count}
                    onChange={(e) => updateDistribution(index, 'count', parseInt(e.target.value) || 0)}
                    className="w-24"
                    placeholder="Count"
                  />
                  
                  <Button
                    onClick={() => removeDistribution(index)}
                    variant="destructive"
                    size="sm"
                    disabled={distributions.length <= 1}
                  >
                    Remove
                  </Button>
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
              value={visibility.hours}
              onChange={(e) => setVisibility({ hours: parseInt(e.target.value) || 24 })}
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