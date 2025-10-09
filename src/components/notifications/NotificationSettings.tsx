import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { 
  enablePush,
  getNotificationStatus, 
} from '@/features/notifications/enablePush';
import { Bell, BellOff, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface NotificationStatusType {
  permission: NotificationPermission;
  enabled: boolean;
  endpoint: string | null;
}

export default function NotificationSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState<NotificationStatusType>({
    permission: 'default',
    enabled: false,
    endpoint: null
  });
  const [loading, setLoading] = useState(false);

  // Update status periodically
  useEffect(() => {
    const updateStatus = async () => {
      const s = await getNotificationStatus();
      setStatus(s);
    };
    updateStatus();
    const interval = setInterval(updateStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleEnableNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      await enablePush();
      
      toast({
        title: "✅ Notifications Enabled",
        description: "Push notifications are now active!",
      });
      
      const s = await getNotificationStatus();
      setStatus(s);
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getPermissionColor = (permission: NotificationPermission) => {
    switch (permission) {
      case 'granted': return 'default';
      case 'denied': return 'destructive';
      default: return 'secondary';
    }
  };

  const getPermissionIcon = (permission: NotificationPermission) => {
    switch (permission) {
      case 'granted': return <Bell className="w-4 h-4" />;
      case 'denied': return <BellOff className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Please log in to manage notifications</p>
        </CardContent>
      </Card>
    );
  }

  const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;

  return (
    <div className="space-y-6">
      {/* Permission Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getPermissionIcon(status.permission)}
            Notification Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Permission:</span>
            <Badge variant={getPermissionColor(status.permission)}>
              {status.permission}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Browser Support:</span>
            <Badge variant={isSupported ? 'default' : 'destructive'}>
              {isSupported ? 'Supported' : 'Not Supported'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Status:</span>
            <Badge variant={status.enabled ? 'default' : 'secondary'}>
              {status.enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
          
          {status.permission === 'denied' && (
            <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <BellOff className="w-4 h-4" />
                <span className="font-medium">Notifications Blocked</span>
              </div>
              <p className="text-sm mt-1 text-red-600 dark:text-red-400">
                Please enable notifications in your browser settings
              </p>
            </div>
          )}

          {status.endpoint && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="text-xs font-mono break-all">
                {status.endpoint.substring(0, 60)}...
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={handleEnableNotifications}
              disabled={loading || status.permission === 'denied' || !isSupported}
              className="flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              {loading ? 'Enabling...' : status.enabled ? 'Re-enable Notifications' : 'Enable Notifications'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
