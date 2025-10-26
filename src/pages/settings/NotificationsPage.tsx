// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import PushToggleV2 from '@/components/push/PushToggleV2';
import WebPushToggle from '@/components/WebPushToggle';
import { useAuth } from '@/hooks/useAuth';
import { 
  enablePushNotifications, 
  getNotificationStatus, 
  getUserFCMTokens, 
  deleteTokenFromDB,
  testNotification,
  needsInstallGuide,
  isIOS,
  isStandalone 
} from '@/features/notifications/enablePush';
import { Bell, BellOff, Smartphone, TestTube, AlertCircle, Info, Bug } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FCMSubscription {
  id: string;
  token: string;
  platform: string;
  device_info: any;
  created_at: string;
  is_active: boolean;
}

type NotificationState = 'OFF' | 'REQUESTING' | 'ENABLING' | 'ON' | 'DISABLING' | 'ERROR';

const NotificationsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State machine for notification toggle
  const [notificationState, setNotificationState] = useState<NotificationState>('OFF');
  const [subscriptions, setSubscriptions] = useState<FCMSubscription[]>([]);
  const [notifStatus, setNotifStatus] = useState<{ 
    supported: boolean; 
    permission: NotificationPermission; 
    enabled: boolean; 
    endpoint?: string;
  }>({ 
    supported: false, 
    permission: 'default', 
    enabled: false 
  });
  const [lastError, setLastError] = useState<string>('');
  const [debugMode, setDebugMode] = useState(false);

  // Load notification status on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const s = await getNotificationStatus();
        if (mounted) setNotifStatus(s);
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  // Load user's FCM subscriptions
  const loadSubscriptions = async () => {
    if (!user?.id) return;
    
    try {
      const userTokens = await getUserFCMTokens(user.id);
      setSubscriptions(userTokens);
      
      // Set initial state based on active subscriptions
      const status = await getNotificationStatus();
      if (userTokens.length > 0 && status.permission === 'granted') {
        setNotificationState('ON');
      } else {
        setNotificationState('OFF');
      }
    } catch (error: any) {
      console.error('Error loading subscriptions:', error);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, [user]);

  // State machine handlers
  const handleToggleNotifications = async () => {
    if (!user) return;

    if (notificationState === 'OFF') {
      // OFF → REQUESTING/ENABLING → ON
      await enableNotifications();
    } else if (notificationState === 'ON') {
      // ON → DISABLING → OFF
      await disableNotifications();
    }
  };

  const enableNotifications = async () => {
    if (!user) return;
    
    setNotificationState('REQUESTING');
    setLastError('');

    try {
      // Show iOS install guide if needed
      if (needsInstallGuide()) {
        setLastError('Please add this app to your Home Screen and reopen to enable notifications');
        setNotificationState('ERROR');
        toast({
          title: "📱 iOS Installation Required",
          description: "Please add this app to your Home Screen and reopen to enable notifications",
          variant: "destructive"
        });
        return;
      }

      setNotificationState('ENABLING');
      
      const result = await enablePushNotifications();
      
      if (result.success) {
        setNotificationState('ON');
        toast({
          title: "✅ Notifications Enabled",
          description: "Push notifications are now active!",
        });
        await loadSubscriptions();
      } else {
        setNotificationState('ERROR');
        const errorMsg = result.error || 'Failed to enable notifications';
        setLastError(errorMsg);
        
        toast({
          title: "❌ Enable Failed",
          description: errorMsg,
          variant: "destructive"
        });
        
        console.error('Enable failed:', result);
      }
    } catch (error: any) {
      setNotificationState('ERROR');
      const errorMsg = error.message || error?.cause || JSON.stringify(error);
      setLastError(errorMsg);
      
      toast({
        title: "❌ Error",
        description: errorMsg,
        variant: "destructive"
      });
      
      console.error('Enable notifications error:', error);
    }
  };

  const disableNotifications = async () => {
    if (!user) return;
    
    setNotificationState('DISABLING');
    setLastError('');

    try {
      // Delete all user tokens from database
      await deleteTokenFromDB(user.id);
      
      setNotificationState('OFF');
      toast({
        title: "🔕 Notifications Disabled",
        description: "Push notifications have been turned off",
      });
      
      await loadSubscriptions();
    } catch (error: any) {
      setNotificationState('ERROR');
      const errorMsg = error.message || error?.cause || JSON.stringify(error);
      setLastError(errorMsg);
      
      toast({
        title: "❌ Disable Failed",
        description: errorMsg,
        variant: "destructive"
      });
      
      console.error('Disable notifications error:', error);
    }
  };

  const handleTestNotification = async () => {
    if (subscriptions.length === 0) return;
    
    try {
      const currentToken = subscriptions[0].token;
      const result = await testNotification(currentToken);
      
      if (result.success) {
        toast({
          title: "🧪 Test Sent",
          description: "Check for the test notification!",
        });
      } else {
        toast({
          title: "❌ Test Failed",
          description: "Test notification failed",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const debugPayload = () => {
    if (!user) return;
    
    const platform = /iPhone|iPad|iPod/.test(navigator.userAgent) ? 'iOS' : 
                     /Android/.test(navigator.userAgent) ? 'Android' : 'unknown';
    const payload = {
      user_id: user.id,
      token: subscriptions[0]?.token || 'NO_TOKEN',
      platform,
      device_info: {
        userAgent: navigator.userAgent,
        platform,
        timestamp: new Date().toISOString(),
        isStandalone: isStandalone(),
        url: window.location.href
      },
      is_active: true
    };
    
    console.log('🐛 [M1SSION FCM] Debug payload:', payload);
    toast({
      title: "🐛 Debug",
      description: "Payload logged to console",
    });
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

  const getStateIcon = (state: NotificationState) => {
    switch (state) {
      case 'ON': return <Bell className="w-4 h-4 text-green-500" />;
      case 'OFF': return <BellOff className="w-4 h-4 text-gray-500" />;
      case 'ERROR': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const isToggleDisabled = () => {
    return (
      !user ||
      !notifStatus.supported ||
      notifStatus.permission === 'denied' ||
      ['REQUESTING', 'ENABLING', 'DISABLING'].includes(notificationState)
    );
  };

  const isToggleOn = () => {
    return notificationState === 'ON';
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

  // Feature flag for PushToggleV2
  const showV2 = import.meta.env.VITE_PUSH_TOGGLE_V2 === '1';

  return (
    <div className="space-y-6">
      {/* Web Push Notifications (V2/V1) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Web Push Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showV2 ? (
            <PushToggleV2 data-push-toggle-v2 />
          ) : (
            <WebPushToggle data-push-toggle-v1 />
          )}
        </CardContent>
      </Card>

      {/* FCM Toggle Switch */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getStateIcon(notificationState)}
              FCM Push (Mobile Apps)
            </div>
            <Switch
              checked={isToggleOn()}
              onCheckedChange={handleToggleNotifications}
              disabled={isToggleDisabled()}
            />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>State:</span>
            <Badge variant={notificationState === 'ON' ? 'default' : notificationState === 'ERROR' ? 'destructive' : 'secondary'}>
              {notificationState}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Permission:</span>
            <Badge variant={getPermissionColor(notifStatus.permission)}>
              {notifStatus.permission}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Platform:</span>
            <Badge variant="outline">
              {/iPhone|iPad|iPod/.test(navigator.userAgent) ? 'iOS' : 
               /Android/.test(navigator.userAgent) ? 'Android' : 'unknown'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Active Tokens:</span>
            <Badge variant="outline">
              {subscriptions.length}
            </Badge>
          </div>
          
          {lastError && (
            <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-sm mt-1 text-red-600 dark:text-red-400">
                {lastError}
              </p>
            </div>
          )}
          
          {needsInstallGuide() && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Smartphone className="w-4 h-4" />
                <span className="font-medium">iOS Installation Required</span>
              </div>
              <p className="text-sm mt-1 text-amber-600 dark:text-amber-400">
                Add this app to your Home Screen and reopen to enable notifications
              </p>
            </div>
          )}
          
          {notifStatus.permission === 'denied' && (
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
              variant="outline"
              onClick={handleTestNotification}
              disabled={subscriptions.length === 0}
              className="flex items-center gap-2"
            >
              <TestTube className="w-4 h-4" />
              Test Notification
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setDebugMode(!debugMode)}
              className="flex items-center gap-2"
            >
              <Bug className="w-4 h-4" />
              Debug Mode
            </Button>
            
            {debugMode && (
              <Button 
                variant="outline"
                onClick={debugPayload}
                className="flex items-center gap-2"
              >
                <Info className="w-4 h-4" />
                Debug Payload
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Subscriptions */}
      {subscriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Active Subscriptions ({subscriptions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{sub.platform}</Badge>
                    <Badge variant={sub.is_active ? 'default' : 'secondary'}>
                      {sub.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="font-medium">Token:</span> 
                      <code className="ml-2 text-xs bg-muted px-2 py-1 rounded">
                        {sub.token.substring(0, 20)}...
                      </code>
                    </div>
                    
                    <div>
                      <span className="font-medium">Created:</span> 
                      <span className="ml-2">{new Date(sub.created_at).toLocaleString()}</span>
                    </div>
                    
                    {sub.device_info?.userAgent && (
                      <div>
                        <span className="font-medium">Device:</span> 
                        <span className="ml-2 text-xs text-muted-foreground">
                          {sub.device_info.userAgent.substring(0, 60)}...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default NotificationsPage;

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™