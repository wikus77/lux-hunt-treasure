// @ts-nocheck
/**
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * Utenti (Realtime) Panel Component
 * Shows real-time user list with profile data from Supabase
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Users, AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';

// Type definition for profile data
type Profile = {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  referral_code?: string | null;
  created_at?: string;
  email?: string | null;
};

const UsersRealtimePanel: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const ITEMS_PER_PAGE = 50;

  // Helper function to get display name
  const getDisplayName = (profile: Profile): string => {
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`;
    }
    if (profile.full_name) {
      return profile.full_name;
    }
    return profile.email || 'Utente sconosciuto';
  };

  // Fetch initial data and count
  const fetchData = useCallback(async (offset = 0, isLoadMore = false) => {
    if (isLoadMore) {
      setIsLoadingMore(true);
    } else {
      setIsLoading(true);
      setError(null);
    }

    try {
      // Get total count
      if (offset === 0) {
        const { count, error: countError } = await supabase
          .from('profiles')
          .select('*', { head: true, count: 'exact' });

        if (countError) {
          throw new Error(`Errore nel conteggio: ${countError.message}`);
        }

        setTotalCount(count || 0);
      }

      // Get profiles data
      const { data, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, full_name, referral_code, created_at, email')
        .order('created_at', { ascending: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1);

      if (profilesError) {
        throw new Error(`Errore nel caricamento profili: ${profilesError.message}`);
      }

      const newProfiles = data || [];
      
      if (offset === 0) {
        setProfiles(newProfiles);
      } else {
        setProfiles(prev => [...prev, ...newProfiles]);
      }

      // Check if there are more items to load
      setHasMore(newProfiles.length === ITEMS_PER_PAGE);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      setError(errorMessage);
      console.error('Error fetching profiles:', err);
      
      if (!isLoadMore) {
        toast.error(`Errore nel caricamento dati: ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  // Load more data
  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      fetchData(profiles.length, true);
    }
  }, [fetchData, profiles.length, isLoadingMore, hasMore]);

  // Refresh data
  const refreshData = useCallback(() => {
    fetchData(0, false);
  }, [fetchData]);

  // Set up real-time subscription
  useEffect(() => {
    // Initial data load
    fetchData();

    // Set up real-time subscription
    const channel = supabase
      .channel('realtime:profiles')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profiles' 
      }, (payload) => {
        console.log('Real-time profiles update:', payload);

        switch (payload.eventType) {
          case 'INSERT':
            if (payload.new) {
              setProfiles(prev => [payload.new as Profile, ...prev]);
              setTotalCount(prev => prev + 1);
              toast.success('Nuovo utente registrato!');
            }
            break;

          case 'UPDATE':
            if (payload.new) {
              setProfiles(prev => 
                prev.map(profile => 
                  profile.id === payload.new.id 
                    ? { ...profile, ...payload.new } as Profile
                    : profile
                )
              );
              toast.info('Profilo utente aggiornato');
            }
            break;

          case 'DELETE':
            if (payload.old) {
              setProfiles(prev => 
                prev.filter(profile => profile.id !== payload.old.id)
              );
              setTotalCount(prev => Math.max(0, prev - 1));
              toast.warning('Utente rimosso');
            }
            break;
        }
      })
      .subscribe();

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  // Handle user deletion
  const handleDeleteUser = useCallback(async (userId: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.functions.invoke('admin-delete-user', {
        body: { user_id: userId }
      });

      if (error || !data?.success) {
        throw new Error(data?.error || error?.message || 'Delete failed');
      }

      // Optimistic update - remove user from local state
      setProfiles(prev => prev.filter(profile => profile.id !== userId));
      setTotalCount(prev => Math.max(0, prev - 1));
      
      toast.success('Utente cancellato con successo');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      console.error('Error deleting user:', err);
      toast.error(`Errore nella cancellazione: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Format date helper
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Data non disponibile';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: it });
    } catch {
      return 'Data non valida';
    }
  };

  return (
    <Card 
      className="m1-relief border-0"
      style={{
        borderRadius: '24px'
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Users className="h-5 w-5 text-primary" />
          Utenti (Realtime)
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            Totale utenti: {totalCount}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">{error}</span>
          </div>
        )}

        {isLoading && profiles.length === 0 ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <>
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-foreground">Nome</TableHead>
                    <TableHead className="text-foreground">Referral Code</TableHead>
                    <TableHead className="text-foreground">User ID</TableHead>
                    <TableHead className="text-foreground">Data Iscrizione</TableHead>
                    <TableHead className="text-foreground">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nessun utente trovato
                      </TableCell>
                    </TableRow>
                  ) : (
                    profiles.map((profile) => (
                      <TableRow key={profile.id} className="hover:bg-muted/50">
                        <TableCell className="font-medium text-foreground">
                          {getDisplayName(profile)}
                        </TableCell>
                        <TableCell className="text-foreground">
                          {profile.referral_code ? (
                            <Badge variant="outline" className="font-mono text-xs">
                              {profile.referral_code}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {profile.id}
                        </TableCell>
                        <TableCell className="text-sm text-foreground">
                          {formatDate(profile.created_at)}
                        </TableCell>
                        <TableCell>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-8 px-2"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Cancella
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Conferma cancellazione utente</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Sei sicuro di voler cancellare l'utente "{getDisplayName(profile)}"? 
                                  Questa azione è irreversibile e eliminerà l'utente sia da auth.users che da public.profiles.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annulla</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(profile.id)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Cancella utente
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {hasMore && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={isLoadingMore}
                  className="min-w-[120px]"
                >
                  {isLoadingMore ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Caricamento...
                    </>
                  ) : (
                    'Carica altri 50'
                  )}
                </Button>
              </div>
            )}

            {!hasMore && profiles.length > 0 && (
              <div className="text-center pt-4">
                <span className="text-sm text-muted-foreground">
                  Tutti i {totalCount} utenti sono stati caricati
                </span>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UsersRealtimePanel;