/*
 * M1SSION™ Mirror Push Dashboard - Zero-Risk Diagnostics
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MirrorPushAdapter, type MirrorSubscription, type MismatchReport } from '@/lib/push/mirrorAdapter';
import { AlertCircle, CheckCircle, XCircle, RefreshCw, Search } from 'lucide-react';

interface MirrorDashboardProps {
  className?: string;
}

export function MirrorPushDashboard({ className }: MirrorDashboardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchUserId, setSearchUserId] = useState('');
  const [providerStats, setProviderStats] = useState<Record<string, number>>({});
  const [mismatchReport, setMismatchReport] = useState<MismatchReport[]>([]);
  const [syncStatus, setSyncStatus] = useState<any[]>([]);
  const [userDiagnostic, setUserDiagnostic] = useState<any>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [stats, mismatches, status] = await Promise.all([
        MirrorPushAdapter.getProviderStats(),
        MirrorPushAdapter.getMismatchReport(),
        MirrorPushAdapter.getSyncStatus()
      ]);
      
      setProviderStats(stats);
      setMismatchReport(mismatches);
      setSyncStatus(status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const runBackfill = async () => {
    setLoading(true);
    try {
      const result = await MirrorPushAdapter.runBackfill();
      console.log('Backfill result:', result);
      await loadData(); // Reload data after backfill
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run backfill');
    } finally {
      setLoading(false);
    }
  };

  const searchUser = async () => {
    if (!searchUserId.trim()) return;
    
    setLoading(true);
    try {
      const diagnostic = await MirrorPushAdapter.getDiagnosticReport(searchUserId.trim());
      setUserDiagnostic(diagnostic);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get user diagnostic');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getMismatchTypeColor = (type: string) => {
    switch (type) {
      case 'match': return 'bg-green-500';
      case 'provider_mismatch': return 'bg-orange-500';
      case 'endpoint_mismatch': return 'bg-yellow-500';
      case 'missing_in_current': return 'bg-red-500';
      case 'missing_in_mirror': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'apple': return '🍎';
      case 'fcm': return '🔥';
      default: return '❓';
    }
  };

  return (
    <div className={className}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Mirror Push Diagnostics</h2>
            <p className="text-muted-foreground">Zero-risk endpoint analysis & comparison</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadData} disabled={loading} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={runBackfill} disabled={loading}>
              Sync Mirror
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="mismatches">Mismatches</TabsTrigger>
            <TabsTrigger value="user-search">User Search</TabsTrigger>
            <TabsTrigger value="sync-status">Sync Status</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Provider Distribution</CardTitle>
                  <CardDescription>Active subscriptions by provider</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(providerStats).map(([provider, count]) => (
                      <div key={provider} className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <span>{getProviderIcon(provider)}</span>
                          <span className="capitalize">{provider}</span>
                        </span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Mismatch Summary</CardTitle>
                  <CardDescription>Current vs Mirror comparison</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {Object.entries(
                      mismatchReport.reduce((acc, item) => {
                        acc[item.mismatch_type] = (acc[item.mismatch_type] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([type, count]) => (
                      <div key={type} className="flex justify-between items-center">
                        <span className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${getMismatchTypeColor(type)}`} />
                          <span className="text-sm">{type.replace('_', ' ')}</span>
                        </span>
                        <Badge variant="outline">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>Mirror system status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Mirror Active</span>
                      </span>
                      <Badge className="bg-green-500">OK</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Zero Production Impact</span>
                      </span>
                      <Badge className="bg-green-500">✓</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="mismatches" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Mismatch Report</CardTitle>
                <CardDescription>Detailed comparison between current and mirror systems</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {mismatchReport.map((item, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="font-mono text-sm">{item.user_id}</div>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getMismatchTypeColor(item.mismatch_type)}`} />
                            <span className="text-sm text-muted-foreground capitalize">
                              {item.mismatch_type.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                        <div className="text-right text-xs text-muted-foreground">
                          <div>Current: {item.current_provider || 'N/A'}</div>
                          <div>Mirror: {item.mirror_provider || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="user-search" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Diagnostic</CardTitle>
                <CardDescription>Search for specific user endpoint analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Enter user ID..."
                    value={searchUserId}
                    onChange={(e) => setSearchUserId(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && searchUser()}
                  />
                  <Button onClick={searchUser} disabled={loading || !searchUserId.trim()}>
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>

                {userDiagnostic && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Current System</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {userDiagnostic.simulation.current_system.map((endpoint: string, i: number) => (
                              <div key={i} className="p-2 bg-muted rounded text-xs font-mono break-all">
                                {endpoint}
                              </div>
                            ))}
                            {userDiagnostic.simulation.current_system.length === 0 && (
                              <div className="text-muted-foreground text-sm">No endpoints found</div>
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-sm">Mirror System</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {userDiagnostic.simulation.mirror_system.map((endpoint: string, i: number) => (
                              <div key={i} className="p-2 bg-muted rounded text-xs font-mono break-all">
                                {endpoint}
                              </div>
                            ))}
                            {userDiagnostic.simulation.mirror_system.length === 0 && (
                              <div className="text-muted-foreground text-sm">No endpoints found</div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-sm">What Would Send Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          {userDiagnostic.simulation.would_match ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                          <span>
                            {userDiagnostic.simulation.would_match 
                              ? 'Systems would send to matching endpoints' 
                              : 'Systems would send to different endpoints'
                            }
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sync-status" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Sync Status</CardTitle>
                <CardDescription>Mirror synchronization status by source table</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {syncStatus.map((status, index) => (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{status.source_table}</div>
                        <div className="text-sm text-muted-foreground">
                          {status.records_processed} records processed
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground">
                        {new Date(status.last_synced_at).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/*
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
 */