/**
 * Battle Audit Panel - Admin Tool for Phase 7
 * Inspect battle integrity, detect tampering, view audit trail
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Shield, AlertTriangle, CheckCircle, XCircle, Search, Flag } from 'lucide-react';
import type { BattleAuditReport } from '@/types/battle';
import { toast } from 'sonner';

export function BattleAuditPanel() {
  const [battleId, setBattleId] = useState('');
  const [loading, setLoading] = useState(false);
  const [auditReport, setAuditReport] = useState<BattleAuditReport | null>(null);
  const [flagReason, setFlagReason] = useState('');

  const runAudit = async () => {
    if (!battleId.trim()) {
      toast.error('Please enter a Battle ID');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('audit_battle' as any, {
        p_battle_id: battleId.trim(),
      });

      if (error) {
        console.error('Audit RPC error:', error);
        toast.error(`Audit failed: ${error.message}`);
        return;
      }

      if (!data) {
        toast.error('No audit data returned');
        return;
      }

      // Type guard and cast
      const auditData = data as any;
      if (auditData.error) {
        toast.error(auditData.error);
        return;
      }

      setAuditReport(auditData as BattleAuditReport);
      toast.success('Audit completed');
    } catch (err: any) {
      console.error('Audit exception:', err);
      toast.error(`Unexpected error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const flagBattle = async () => {
    if (!auditReport?.battle_id || !flagReason.trim()) {
      toast.error('Please provide a reason for flagging');
      return;
    }

    try {
      const { data, error } = await supabase.rpc('flag_battle_suspicious' as any, {
        p_battle_id: auditReport.battle_id,
        p_reason: flagReason.trim(),
      });

      if (error) {
        toast.error(`Failed to flag: ${error.message}`);
        return;
      }

      // Type guard
      const result = data as any;
      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Battle flagged as suspicious');
      setFlagReason('');
    } catch (err: any) {
      toast.error(`Exception: ${err.message}`);
    }
  };

  const isClean = auditReport?.tamper_flags?.length === 0;

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Battle Audit Inspector
          </CardTitle>
          <CardDescription>
            Phase 7: Verify battle integrity, detect tampering, and review audit trail
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter Battle ID (UUID)"
              value={battleId}
              onChange={(e) => setBattleId(e.target.value)}
              className="flex-1"
            />
            <Button onClick={runAudit} disabled={loading}>
              <Search className="h-4 w-4 mr-2" />
              {loading ? 'Auditing...' : 'Run Audit'}
            </Button>
          </div>

          {auditReport && (
            <div className="space-y-6 mt-6">
              {/* Status Overview */}
              <Alert variant={isClean ? 'default' : 'destructive'}>
                <div className="flex items-center gap-2">
                  {isClean ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                  )}
                  <AlertDescription className="flex-1">
                    {isClean ? (
                      <span className="font-medium">✓ Battle integrity verified - No tampering detected</span>
                    ) : (
                      <span className="font-medium">
                        ⚠️ {auditReport.tamper_flags.length} issue(s) detected
                      </span>
                    )}
                  </AlertDescription>
                </div>
              </Alert>

              {/* Battle Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Battle Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-muted-foreground">Battle ID:</span>
                      <p className="font-mono text-xs break-all">{auditReport.battle_id}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <Badge variant="outline" className="ml-2">
                        {auditReport.status}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Creator:</span>
                      <p className="font-mono text-xs break-all">{auditReport.creator_id}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Opponent:</span>
                      <p className="font-mono text-xs break-all">{auditReport.opponent_id || 'N/A'}</p>
                    </div>
                    {auditReport.winner_id && (
                      <div>
                        <span className="text-muted-foreground">Winner:</span>
                        <p className="font-mono text-xs break-all">{auditReport.winner_id}</p>
                      </div>
                    )}
                    <div>
                      <span className="text-muted-foreground">Stake:</span>
                      <p>
                        {auditReport.metadata?.stake_amount} {auditReport.metadata?.stake_type}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Checks Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Security Checks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>RNG Seed Integrity</span>
                    <Badge variant={auditReport.rng_check === 'ok' ? 'default' : 'destructive'}>
                      {auditReport.rng_check === 'ok' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {auditReport.rng_check.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Ledger Consistency</span>
                    <Badge variant={auditReport.ledger_check === 'ok' ? 'default' : 'destructive'}>
                      {auditReport.ledger_check === 'ok' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {auditReport.ledger_check.toUpperCase()}
                    </Badge>
                  </div>
                  {auditReport.rng_seed && (
                    <div>
                      <span className="text-muted-foreground text-xs">RNG Seed:</span>
                      <p className="font-mono text-xs break-all mt-1">{auditReport.rng_seed}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Tamper Flags */}
              {auditReport.tamper_flags.length > 0 && (
                <Card className="border-destructive">
                  <CardHeader>
                    <CardTitle className="text-lg text-destructive flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Tamper Detection Flags
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {auditReport.tamper_flags.map((flag, idx) => (
                        <Badge key={idx} variant="destructive" className="mr-2">
                          {flag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Detailed Tabs */}
              <Tabs defaultValue="audit" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="audit">Audit Log ({auditReport.audit_log_entries.length})</TabsTrigger>
                  <TabsTrigger value="transfers">Transfers ({auditReport.transfers?.length || 0})</TabsTrigger>
                  <TabsTrigger value="participants">
                    Participants ({auditReport.participants?.length || 0})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="audit">
                  <Card>
                    <CardContent className="pt-6">
                      <ScrollArea className="h-[400px] w-full">
                        <div className="space-y-4">
                          {auditReport.audit_log_entries.map((entry: any) => (
                            <div key={entry.id} className="border-l-2 border-primary pl-4 pb-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline">{entry.event_type}</Badge>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(entry.timestamp).toLocaleString()}
                                </span>
                              </div>
                              {entry.user_id && (
                                <p className="text-xs text-muted-foreground font-mono mb-2">
                                  User: {entry.user_id}
                                </p>
                              )}
                              {entry.rng_seed && (
                                <p className="text-xs text-muted-foreground font-mono mb-2">
                                  RNG: {entry.rng_seed.substring(0, 16)}...
                                </p>
                              )}
                              <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                                {JSON.stringify(entry.payload, null, 2)}
                              </pre>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="transfers">
                  <Card>
                    <CardContent className="pt-6">
                      {auditReport.transfers && auditReport.transfers.length > 0 ? (
                        <ScrollArea className="h-[400px]">
                          <div className="space-y-3">
                            {auditReport.transfers.map((transfer: any) => (
                              <div key={transfer.id} className="border p-3 rounded">
                                <div className="flex items-center justify-between mb-2">
                                  <Badge>{transfer.transfer_type}</Badge>
                                  <span className="font-bold">{transfer.amount}</span>
                                </div>
                                <p className="text-xs text-muted-foreground font-mono">
                                  From: {transfer.from_user_id}
                                </p>
                                <p className="text-xs text-muted-foreground font-mono">
                                  To: {transfer.to_user_id}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(transfer.created_at).toLocaleString()}
                                </p>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      ) : (
                        <p className="text-center text-muted-foreground py-8">No transfers recorded</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="participants">
                  <Card>
                    <CardContent className="pt-6">
                      {auditReport.participants && auditReport.participants.length > 0 ? (
                        <div className="space-y-3">
                          {auditReport.participants.map((participant: any) => (
                            <div key={participant.id} className="border p-3 rounded">
                              <div className="flex items-center justify-between mb-2">
                                <Badge variant="outline">{participant.role}</Badge>
                                {participant.is_winner && (
                                  <Badge variant="default" className="bg-green-500">
                                    Winner
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground font-mono mb-2">
                                {participant.user_id}
                              </p>
                              {participant.reaction_ms && (
                                <p className="text-sm">
                                  Reaction: <span className="font-bold">{participant.reaction_ms}ms</span>
                                </p>
                              )}
                              {participant.ping_ms && (
                                <p className="text-sm text-muted-foreground">Ping: {participant.ping_ms}ms</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-8">No participants recorded</p>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              {/* Admin Actions */}
              {!isClean && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Flag className="h-5 w-5" />
                      Flag as Suspicious
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Textarea
                      placeholder="Reason for flagging (required)"
                      value={flagReason}
                      onChange={(e) => setFlagReason(e.target.value)}
                      rows={3}
                    />
                    <Button onClick={flagBattle} variant="destructive" disabled={!flagReason.trim()}>
                      <Flag className="h-4 w-4 mr-2" />
                      Flag Battle
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
