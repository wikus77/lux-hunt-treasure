
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertTriangle, Search, Filter, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';

interface AbuseLogEntry {
  id: string;
  user_id: string;
  event_type: string;
  timestamp: string;
}

const AbuseLogsPage = () => {
  const [logs, setLogs] = useState<AbuseLogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AbuseLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchUserId, setSearchUserId] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [eventTypes, setEventTypes] = useState<string[]>([]);

  // Debounce search input (300ms delay)
  const debouncedSearchUserId = useDebounce(searchUserId, 300);

  // Fetch abuse logs from Supabase
  const fetchAbuseLogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('abuse_logs')
        .select('id, user_id, event_type, timestamp')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching abuse logs:', error);
        toast.error('Errore nel caricamento dei log');
        return;
      }

      setLogs(data || []);
      
      // Extract unique event types for filter dropdown
      const uniqueEventTypes = [...new Set(data?.map(log => log.event_type) || [])];
      setEventTypes(uniqueEventTypes);

    } catch (error) {
      console.error('Exception fetching abuse logs:', error);
      toast.error('Errore imprevisto nel caricamento');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters to logs
  const applyFilters = () => {
    let filtered = [...logs];

    // Filter by event type
    if (eventTypeFilter !== 'all') {
      filtered = filtered.filter(log => log.event_type === eventTypeFilter);
    }

    // Filter by user ID (case insensitive partial match)
    if (debouncedSearchUserId.trim()) {
      filtered = filtered.filter(log => 
        log.user_id.toLowerCase().includes(debouncedSearchUserId.toLowerCase().trim())
      );
    }

    setFilteredLogs(filtered);
  };

  // Load data on component mount
  useEffect(() => {
    fetchAbuseLogs();
  }, []);

  // Apply filters when search or filter changes (using debounced search)
  useEffect(() => {
    applyFilters();
  }, [logs, debouncedSearchUserId, eventTypeFilter]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('it-IT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getEventTypeBadgeColor = (eventType: string) => {
    switch (eventType) {
      case 'buzz_click':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'email_send':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'checkout_start':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-40" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400" />
          <div>
            <h1 className="text-3xl font-bold text-white">Registro Abusi</h1>
            <p className="text-gray-400">Monitoraggio delle attività sospette degli utenti</p>
          </div>
        </div>

        {/* Filters Card */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filtri di Ricerca
            </CardTitle>
            <CardDescription className="text-gray-400">
              Filtra i log per tipo di evento o ID utente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* User ID Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Cerca User ID</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Inserisci ID utente..."
                    value={searchUserId}
                    onChange={(e) => setSearchUserId(e.target.value)}
                    className="pl-10 bg-gray-800 border-gray-600 text-white"
                  />
                </div>
              </div>

              {/* Event Type Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Tipo Evento</label>
                <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                  <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                    <SelectValue placeholder="Seleziona tipo evento" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all">Tutti i tipi</SelectItem>
                    {eventTypes.map(type => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Refresh Button */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Azioni</label>
                <Button 
                  onClick={fetchAbuseLogs}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Ricarica
                </Button>
              </div>
            </div>

            {/* Results Summary */}
            <div className="mt-4 text-sm text-gray-400">
              Mostrando {filteredLogs.length} di {logs.length} log totali
            </div>
          </CardContent>
        </Card>

        {/* Logs Table */}
        <Card className="bg-gray-900/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Log degli Abusi</CardTitle>
            <CardDescription className="text-gray-400">
              Elenco cronologico delle attività monitorate (ordinato per timestamp discendente)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingSkeleton />
            ) : filteredLogs.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nessun log trovato con i filtri applicati</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">User ID</TableHead>
                      <TableHead className="text-gray-300">Tipo Evento</TableHead>
                      <TableHead className="text-gray-300">Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id} className="border-gray-700 hover:bg-gray-800/50">
                        <TableCell className="font-mono text-sm text-gray-300">
                          {log.user_id}
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={getEventTypeBadgeColor(log.event_type)}
                          >
                            {log.event_type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {formatTimestamp(log.timestamp)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AbuseLogsPage;
