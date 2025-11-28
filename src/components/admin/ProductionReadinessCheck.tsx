// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Production Readiness Checklist - Launch 19 Dec 2025

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw, Rocket } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface CheckItem {
  id: string;
  name: string;
  description: string;
  status: 'pass' | 'fail' | 'warning' | 'checking';
  details?: string;
}

export const ProductionReadinessCheck: React.FC = () => {
  const [checks, setChecks] = useState<CheckItem[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const runAllChecks = async () => {
    setIsRunning(true);
    const results: CheckItem[] = [];

    // 1. Supabase Connection
    try {
      const { error } = await supabase.from('profiles').select('count').limit(1);
      results.push({
        id: 'supabase',
        name: 'Supabase Connection',
        description: 'Database connection is working',
        status: error ? 'fail' : 'pass',
        details: error?.message
      });
    } catch (e: any) {
      results.push({
        id: 'supabase',
        name: 'Supabase Connection',
        description: 'Database connection is working',
        status: 'fail',
        details: e.message
      });
    }

    // 2. Auth System
    try {
      const { data: { session } } = await supabase.auth.getSession();
      results.push({
        id: 'auth',
        name: 'Auth System',
        description: 'Authentication system is configured',
        status: 'pass',
        details: session ? 'Session active' : 'No active session (expected for public check)'
      });
    } catch (e: any) {
      results.push({
        id: 'auth',
        name: 'Auth System',
        description: 'Authentication system is configured',
        status: 'fail',
        details: e.message
      });
    }

    // 3. Service Worker
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      results.push({
        id: 'sw',
        name: 'Service Worker',
        description: 'PWA service worker is registered',
        status: registration ? 'pass' : 'warning',
        details: registration ? `Scope: ${registration.scope}` : 'Not registered'
      });
    } catch (e: any) {
      results.push({
        id: 'sw',
        name: 'Service Worker',
        description: 'PWA service worker is registered',
        status: 'fail',
        details: e.message
      });
    }

    // 4. Push Permissions
    try {
      const permission = Notification.permission;
      results.push({
        id: 'push',
        name: 'Push Notifications',
        description: 'Browser notification permission',
        status: permission === 'granted' ? 'pass' : permission === 'denied' ? 'fail' : 'warning',
        details: `Permission: ${permission}`
      });
    } catch {
      results.push({
        id: 'push',
        name: 'Push Notifications',
        description: 'Browser notification permission',
        status: 'warning',
        details: 'Not supported in this browser'
      });
    }

    // 5. Geolocation
    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      results.push({
        id: 'geo',
        name: 'Geolocation',
        description: 'Location access permission',
        status: permission.state === 'granted' ? 'pass' : permission.state === 'denied' ? 'fail' : 'warning',
        details: `Permission: ${permission.state}`
      });
    } catch {
      results.push({
        id: 'geo',
        name: 'Geolocation',
        description: 'Location access permission',
        status: 'warning',
        details: 'Permission API not supported'
      });
    }

    // 6. LocalStorage
    try {
      localStorage.setItem('_m1_test', '1');
      localStorage.removeItem('_m1_test');
      results.push({
        id: 'storage',
        name: 'LocalStorage',
        description: 'Browser storage is available',
        status: 'pass'
      });
    } catch {
      results.push({
        id: 'storage',
        name: 'LocalStorage',
        description: 'Browser storage is available',
        status: 'fail',
        details: 'Storage blocked or unavailable'
      });
    }

    // 7. Environment Variables
    const hasMapTiler = !!import.meta.env.VITE_MAPTILER_KEY_DEV || !!import.meta.env.VITE_MAPTILER_KEY_PROD;
    results.push({
      id: 'env_map',
      name: 'MapTiler API Key',
      description: 'Map provider configured',
      status: hasMapTiler ? 'pass' : 'fail',
      details: hasMapTiler ? 'Key present' : 'Missing VITE_MAPTILER_KEY_*'
    });

    // 8. Stripe (check if configured)
    const hasStripe = typeof window !== 'undefined' && window.__STRIPE_PK__;
    results.push({
      id: 'stripe',
      name: 'Stripe Integration',
      description: 'Payment system configured',
      status: hasStripe ? 'pass' : 'warning',
      details: hasStripe ? 'Public key loaded' : 'Key loaded lazily or missing'
    });

    // 9. Active Missions
    try {
      const { data: missions, error } = await supabase
        .from('missions')
        .select('id')
        .eq('status', 'published')
        .limit(1);
      
      results.push({
        id: 'missions',
        name: 'Active Missions',
        description: 'At least one mission is published',
        status: missions && missions.length > 0 ? 'pass' : 'warning',
        details: missions && missions.length > 0 ? 'Mission available' : 'No published missions'
      });
    } catch (e: any) {
      results.push({
        id: 'missions',
        name: 'Active Missions',
        description: 'At least one mission is published',
        status: 'fail',
        details: e.message
      });
    }

    // 10. HTTPS
    results.push({
      id: 'https',
      name: 'HTTPS',
      description: 'Secure connection',
      status: location.protocol === 'https:' || location.hostname === 'localhost' ? 'pass' : 'fail',
      details: `Protocol: ${location.protocol}`
    });

    setChecks(results);
    setLastRun(new Date());
    setIsRunning(false);
  };

  useEffect(() => {
    runAllChecks();
  }, []);

  const passCount = checks.filter(c => c.status === 'pass').length;
  const failCount = checks.filter(c => c.status === 'fail').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;

  const getStatusIcon = (status: CheckItem['status']) => {
    switch (status) {
      case 'pass': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'fail': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default: return <RefreshCw className="w-5 h-5 animate-spin text-blue-500" />;
    }
  };

  const getOverallStatus = () => {
    if (failCount > 0) return { label: 'NOT READY', color: 'bg-red-500' };
    if (warningCount > 0) return { label: 'READY WITH WARNINGS', color: 'bg-yellow-500' };
    return { label: 'PRODUCTION READY', color: 'bg-green-500' };
  };

  const overall = getOverallStatus();

  return (
    <Card className="glass-card border border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Rocket className="w-6 h-6 text-purple-400" />
            <CardTitle className="text-white">Production Readiness Check</CardTitle>
          </div>
          <Badge className={`${overall.color} text-white`}>
            {overall.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="flex gap-4 text-sm">
          <span className="text-green-400">✓ {passCount} Passed</span>
          <span className="text-red-400">✗ {failCount} Failed</span>
          <span className="text-yellow-400">⚠ {warningCount} Warnings</span>
        </div>

        {/* Checks List */}
        <div className="space-y-2">
          {checks.map((check) => (
            <div
              key={check.id}
              className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(check.status)}
                <div>
                  <p className="text-white font-medium">{check.name}</p>
                  <p className="text-xs text-gray-400">{check.description}</p>
                </div>
              </div>
              {check.details && (
                <span className="text-xs text-gray-500 max-w-[200px] truncate">
                  {check.details}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <Button
            onClick={runAllChecks}
            disabled={isRunning}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Checking...' : 'Run Checks'}
          </Button>
          {lastRun && (
            <span className="text-xs text-gray-500">
              Last run: {lastRun.toLocaleTimeString()}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductionReadinessCheck;


