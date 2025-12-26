// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED
// Landing Telemetry Dashboard - Admin Only

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Clock, RefreshCw, Eye, MousePointer, Users, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface EventCount {
  event_name: string;
  count: number;
}

interface TimeRange {
  label: string;
  value: string;
  hours: number;
}

const TIME_RANGES: TimeRange[] = [
  { label: '1h', value: '1h', hours: 1 },
  { label: '24h', value: '24h', hours: 24 },
  { label: '7d', value: '7d', hours: 168 },
];

const EVENT_LABELS: Record<string, string> = {
  landing_cta_primary_click: 'CTA Primaria Click',
  landing_minitest_choice: 'Mini-test Scelta',
  landing_premium_toggle_open: 'Premium Toggle',
  landing_plan_select: 'Piano Selezionato',
  landing_spectator_click: 'Spectator Click',
  landing_install_click: 'Install Click',
  spectator_page_view: 'Spectator View',
  spectator_locked_click: 'Locked Feature Click',
  spectator_join_click: 'Spectator → Join',
};

const LandingTelemetryPanel: React.FC = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>(TIME_RANGES[1]); // Default 24h
  const [eventCounts, setEventCounts] = useState<EventCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const since = new Date(Date.now() - timeRange.hours * 60 * 60 * 1000).toISOString();
      
      // Query events grouped by event_name
      const { data, error: queryError } = await supabase
        .from('landing_events')
        .select('event_name')
        .gte('created_at', since);

      if (queryError) {
        throw queryError;
      }

      // Count events manually (since we can't use group by in client)
      const counts: Record<string, number> = {};
      (data || []).forEach((row: { event_name: string }) => {
        counts[row.event_name] = (counts[row.event_name] || 0) + 1;
      });

      const eventCountsArray: EventCount[] = Object.entries(counts)
        .map(([event_name, count]) => ({ event_name, count }))
        .sort((a, b) => b.count - a.count);

      setEventCounts(eventCountsArray);
      setLastRefresh(new Date());
    } catch (err) {
      console.error('Telemetry fetch error:', err);
      setError('Errore nel caricamento dei dati');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [timeRange]);

  const totalEvents = eventCounts.reduce((sum, e) => sum + e.count, 0);
  
  // Calculate simple funnel
  const ctaClicks = eventCounts.find(e => e.event_name === 'landing_cta_primary_click')?.count || 0;
  const minitestChoices = eventCounts.find(e => e.event_name === 'landing_minitest_choice')?.count || 0;
  const spectatorClicks = eventCounts.find(e => e.event_name === 'landing_spectator_click')?.count || 0;
  const spectatorJoins = eventCounts.find(e => e.event_name === 'spectator_join_click')?.count || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            Landing Telemetry
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Ultimo aggiornamento: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Time Range Selector */}
          <div className="flex bg-black/40 rounded-lg p-1">
            {TIME_RANGES.map((range) => (
              <button
                key={range.value}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-xs font-bold rounded transition-all ${
                  timeRange.value === range.value
                    ? 'bg-cyan-500 text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
          
          <Button
            onClick={fetchEvents}
            variant="outline"
            size="sm"
            className="border-cyan-500/30 text-cyan-400"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          className="bg-gradient-to-br from-cyan-500/10 to-cyan-500/5 border border-cyan-500/20 rounded-xl p-4"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span className="text-xs text-gray-400">Eventi Totali</span>
          </div>
          <p className="text-2xl font-bold text-white">{totalEvents}</p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-xl p-4"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <MousePointer className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">CTA Clicks</span>
          </div>
          <p className="text-2xl font-bold text-white">{ctaClicks}</p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-xl p-4"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Eye className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400">Spectator</span>
          </div>
          <p className="text-2xl font-bold text-white">{spectatorClicks}</p>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/20 rounded-xl p-4"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-gray-400">Conversioni</span>
          </div>
          <p className="text-2xl font-bold text-white">{spectatorJoins}</p>
        </motion.div>
      </div>

      {/* Funnel Visualization */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          Funnel Semplificato
        </h3>
        
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 text-center">
            <p className="text-2xl font-bold text-cyan-400">{ctaClicks}</p>
            <p className="text-xs text-gray-400">CTA Click</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-600" />
          <div className="flex-1 text-center">
            <p className="text-2xl font-bold text-purple-400">{minitestChoices}</p>
            <p className="text-xs text-gray-400">Mini-test</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-600" />
          <div className="flex-1 text-center">
            <p className="text-2xl font-bold text-yellow-400">{spectatorClicks}</p>
            <p className="text-xs text-gray-400">Spectator</p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-600" />
          <div className="flex-1 text-center">
            <p className="text-2xl font-bold text-green-400">{spectatorJoins}</p>
            <p className="text-xs text-gray-400">Join</p>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-black/40 border border-white/10 rounded-xl p-6">
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          Dettaglio Eventi ({timeRange.label})
        </h3>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="w-6 h-6 text-cyan-400" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-400 text-sm">{error}</div>
        ) : eventCounts.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            Nessun evento nel periodo selezionato
          </div>
        ) : (
          <div className="space-y-2">
            {eventCounts.map((event) => (
              <div
                key={event.event_name}
                className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg"
              >
                <span className="text-sm text-gray-300">
                  {EVENT_LABELS[event.event_name] || event.event_name}
                </span>
                <span className="text-sm font-bold text-cyan-400">{event.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingTelemetryPanel;

