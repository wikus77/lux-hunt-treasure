import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { 
  enablePushNotifications, 
  getNotificationStatus, 
  getUserFCMTokens, 
  regenerateFCMToken,
  testNotification 
} from '@/features/notifications/enablePush';
import { Bell, BellOff, Smartphone, RotateCcw, TestTube, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FCMToken {
  id: string;
  token: string;
  platform: string;
  device_info: any;
  created_at: string;
  is_active: boolean;
}

export default function NotificationSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [status, setStatus] = useState(getNotificationStatus());
  const [tokens, setTokens] = useState<FCMToken[]>([]);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  // Update status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(getNotificationStatus());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Load user tokens
  const loadTokens = async () => {
    if (!user) return;
    
    try {
      const userTokens = await getUserFCMTokens(user.id);
      setTokens(userTokens);
    } catch (error) {
      console.error('Error loading tokens:', error);
    }
  };

  useEffect(() => {
    loadTokens();
  }, [user]);

  const handleEnableNotifications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const result = await enablePushNotifications(user.id);
      
      if (result.success) {
        toast({
          title: "✅ Notifications Enabled",
          description: "Push notifications are now active!",
        });
        await loadTokens();
        setStatus(getNotificationStatus());
      } else {
        toast({
          title: "❌ Enable Failed",
          description: result.error || "Failed to enable notifications",
          variant: "destructive"
        });
      }
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

  const handleRegenerateToken = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const newToken = await regenerateFCMToken();
      
      if (newToken) {
        toast({
          title: "🔄 Token Regenerated",
          description: "New push token generated successfully",
        });
        await loadTokens();
      } else {
        toast({
          title: "❌ Regeneration Failed",
          description: "Failed to regenerate token",
          variant: "destructive"
        });
      }
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

  const handleTestNotification = async () => {
    if (tokens.length === 0) return;
    
    setTesting(true);
    try {
      const currentToken = tokens[0].token;
      const result = await testNotification(currentToken);
      
      if (result.success) {
        toast({
          title: "🧪 Test Sent",
          description: "Check for the test notification!",
        });
      } else {
        toast({
          title: "❌ Test Failed",
          description: result.error || "Test notification failed",
          variant: "destructive"
        });
      }
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setTesting(false);
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
            <Badge variant={status.supported ? 'default' : 'destructive'}>
              {status.supported ? 'Supported' : 'Not Supported'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Platform:</span>
            <Badge variant="outline">
              {status.platform}
            </Badge>
          </div>
          
          {status.needsInstall && (
            <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Smartphone className="w-4 h-4" />
                <span className="font-medium">iOS Installation Required</span>
              </div>
              <p className="text-sm mt-1 text-amber-600 dark:text-amber-400">
                Please add this app to your Home Screen to enable notifications
              </p>
            </div>
          )}
          
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
              disabled={loading || status.permission === 'denied' || !status.supported}
              className="flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              {loading ? 'Enabling...' : 'Enable Notifications'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleRegenerateToken}
              disabled={loading || tokens.length === 0}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              {loading ? 'Regenerating...' : 'Regenerate Token'}
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleTestNotification}
              disabled={testing || tokens.length === 0}
              className="flex items-center gap-2"
            >
              <TestTube className="w-4 h-4" />
              {testing ? 'Testing...' : 'Test Notification'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Tokens */}
      <Card>
        <CardHeader>
          <CardTitle>Active Tokens ({tokens.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {tokens.length === 0 ? (
            <p className="text-muted-foreground">No active tokens found</p>
          ) : (
            <div className="space-y-3">
              {tokens.map((token) => (
                <div key={token.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{token.platform}</Badge>
                    <Badge variant={token.is_active ? 'default' : 'secondary'}>
                      {token.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="font-medium">Token:</span> 
                      <code className="ml-2 text-xs bg-muted px-2 py-1 rounded">
                        {token.token.substring(0, 20)}...
                      </code>
                    </div>
                    
                    <div>
                      <span className="font-medium">Created:</span> 
                      <span className="ml-2">{new Date(token.created_at).toLocaleString()}</span>
                    </div>
                    
                    {token.device_info?.userAgent && (
                      <div>
                        <span className="font-medium">Device:</span> 
                        <span className="ml-2 text-xs text-muted-foreground">
                          {token.device_info.userAgent.substring(0, 60)}...
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}