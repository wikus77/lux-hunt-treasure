// © 2025 Joseph MULÉ – M1SSION™ – Test component for notification counter
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';
import { toast } from 'sonner';

export const NotificationCounterTest: React.FC = () => {
  const { unreadCount, isLoading, error, badgeApiSupported, refreshCount } = useUnreadNotifications();

  const testIncrement = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('test-notification-counter', {
        body: { action: 'increment', delta: 1 }
      });

      if (error) throw error;
      
      toast.success(`Counter incremented! New count: ${data.new_count}`);
    } catch (err) {
      toast.error(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const testDecrement = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('test-notification-counter', {
        body: { action: 'decrement', delta: 1 }
      });

      if (error) throw error;
      
      toast.success(`Counter decremented! New count: ${data.new_count}`);
    } catch (err) {
      toast.error(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const testReset = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('test-notification-counter', {
        body: { action: 'decrement', delta: unreadCount }
      });

      if (error) throw error;
      
      toast.success(`Counter reset! New count: ${data.new_count}`);
    } catch (err) {
      toast.error(`Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center">🔔 Notification Counter Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {isLoading ? '...' : unreadCount}
          </div>
          <div className="text-sm text-muted-foreground">Unread Count</div>
        </div>

        <div className="space-y-2">
          <div className="text-xs">
            <strong>Badge API:</strong> {badgeApiSupported ? '✅ Supported' : '❌ Not supported'}
          </div>
          {error && (
            <div className="text-xs text-destructive">
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={testIncrement} 
            disabled={isLoading}
            size="sm"
            variant="default"
          >
            +1
          </Button>
          <Button 
            onClick={testDecrement} 
            disabled={isLoading || unreadCount === 0}
            size="sm"
            variant="outline"
          >
            -1
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={testReset} 
            disabled={isLoading || unreadCount === 0}
            size="sm"
            variant="destructive"
          >
            Reset
          </Button>
          <Button 
            onClick={refreshCount} 
            disabled={isLoading}
            size="sm"
            variant="secondary"
          >
            Refresh
          </Button>
        </div>

        <div className="text-xs text-center text-muted-foreground">
          Check the bottom navigation "Notice" tab for the badge!
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationCounterTest;