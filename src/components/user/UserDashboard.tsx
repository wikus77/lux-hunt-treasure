/**
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * 
 * M1SSION™ User Dashboard
 * Real-time user sync status and controls
 */

import React from 'react';
import { useUserSyncContext } from './UserSyncProvider';
import UserStatusBadge from './UserStatusBadge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Bell, Settings, Crown, Clock, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

const UserDashboard: React.FC = () => {
  const {
    syncState,
    notifications,
    canUserAccessApp,
    hasEarlyAccess,
    hasPremiumFeatures,
    unreadNotifications,
    refreshSync,
    refreshNotifications,
    markNotificationRead,
    handlePlanUpgrade
  } = useUserSyncContext();

  const handleTestUpgrade = async (plan: string) => {
    const success = await handlePlanUpgrade(plan);
    if (success) {
      console.log(`✅ Successfully upgraded to ${plan}`);
    }
  };

  if (syncState.isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin" />
        <span className="ml-2">Caricamento stato utente...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard Utente</h1>
          <p className="text-gray-400">Gestisci il tuo account M1SSION™</p>
        </div>
        <UserStatusBadge />
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Plan Status */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
          <CardHeader>
            <CardTitle className="flex items-center text-blue-400">
              <Crown className="w-5 h-5 mr-2" />
              Piano Attuale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white capitalize">
              {syncState.plan}
            </div>
            <div className="text-sm text-gray-400 mt-2">
              {canUserAccessApp ? 'Accesso completo' : 'Accesso limitato'}
            </div>
          </CardContent>
        </Card>

        {/* Early Access */}
        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-400">
              <Clock className="w-5 h-5 mr-2" />
              Accesso Anticipato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {syncState.earlyAccessHours}h
            </div>
            <div className="text-sm text-gray-400 mt-2">
              {hasEarlyAccess ? 'Attivo' : 'Non disponibile'}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
          <CardHeader>
            <CardTitle className="flex items-center text-purple-400">
              <Bell className="w-5 h-5 mr-2" />
              Notifiche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {unreadNotifications}
            </div>
            <div className="text-sm text-gray-400 mt-2">
              Non lette
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Permessi Attivi
          </CardTitle>
          <CardDescription>
            Basati sul tuo piano corrente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {syncState.permissions.map((permission, index) => (
              <Badge
                key={index}
                variant={permission.value ? 'default' : 'secondary'}
                className={permission.value ? 'bg-green-500' : 'bg-gray-500'}
              >
                {permission.type.replace('_', ' ').toUpperCase()}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Attività Recente</CardTitle>
          <CardDescription>
            Ultime azioni sul tuo account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {syncState.recentLogs.slice(0, 5).map((log, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                <div>
                  <div className="font-medium text-white">
                    {log.action.replace('_', ' ').toLowerCase()}
                  </div>
                  {log.details && (
                    <div className="text-sm text-gray-400">
                      {JSON.stringify(log.details)}
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-500">
                  {formatDistanceToNow(new Date(log.created_at), { 
                    addSuffix: true, 
                    locale: it 
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Notifiche Recenti</CardTitle>
          <CardDescription>
            Ultime comunicazioni M1SSION™
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.slice(0, 5).map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border ${
                  notification.read_at 
                    ? 'bg-gray-800/30 border-gray-700' 
                    : 'bg-blue-500/10 border-blue-500/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-white">
                      {notification.title}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      {notification.message}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {formatDistanceToNow(new Date(notification.sent_at), { 
                        addSuffix: true, 
                        locale: it 
                      })}
                    </div>
                  </div>
                  {!notification.read_at && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => markNotificationRead(notification.id)}
                    >
                      Segna letto
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Test Controls (Development) */}
      <Card className="border-yellow-500/20 bg-yellow-500/5">
        <CardHeader>
          <CardTitle className="text-yellow-400">Test Controls</CardTitle>
          <CardDescription>
            Controlli di test per lo sviluppo
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTestUpgrade('silver')}
            >
              Test Silver
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTestUpgrade('gold')}
            >
              Test Gold
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTestUpgrade('black')}
            >
              Test Black
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTestUpgrade('titanium')}
            >
              Test Titanium
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTestUpgrade('base')}
            >
              Test Base
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshSync}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sync Status */}
      <div className="text-center text-sm text-gray-500">
        Ultimo aggiornamento: {syncState.lastSyncAt ? formatDistanceToNow(new Date(syncState.lastSyncAt), { addSuffix: true, locale: it }) : 'Mai'}
      </div>
    </div>
  );
};

export default UserDashboard;