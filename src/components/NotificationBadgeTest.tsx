// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Notification Badge Test Component for Development

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useUnreadNotifications } from '@/hooks/useUnreadNotifications';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const NotificationBadgeTest: React.FC = () => {
  const { isAuthenticated, getCurrentUser } = useUnifiedAuth();
  const { unreadCount, isLoading, error, badgeApiSupported, refreshCount } = useUnreadNotifications();
  const [testing, setTesting] = useState(false);
  const currentUser = getCurrentUser();
  const userId = currentUser?.id;

  // Test increment notification counter
  const handleIncrement = async () => {
    if (!userId) return;
    
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-notification-counter', {
        body: { action: 'increment', delta: 1 }
      });
      
      if (error) {
        console.error('Increment error:', error);
      } else {
        console.log('Increment success:', data);
      }
    } catch (err) {
      console.error('Increment failed:', err);
    } finally {
      setTesting(false);
    }
  };

  // Test decrement notification counter
  const handleDecrement = async () => {
    if (!userId) return;
    
    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('test-notification-counter', {
        body: { action: 'decrement', delta: 1 }
      });
      
      if (error) {
        console.error('Decrement error:', error);
      } else {
        console.log('Decrement success:', data);
      }
    } catch (err) {
      console.error('Decrement failed:', err);
    } finally {
      setTesting(false);
    }
  };

  // Reset counter to zero
  const handleReset = async () => {
    if (!userId) return;
    
    setTesting(true);
    try {
      const { error } = await supabase
        .from('notification_counters')
        .upsert({ 
          user_id: userId, 
          unread_count: 0,
          updated_at: new Date().toISOString()
        });
      
      if (error) {
        console.error('Reset error:', error);
      } else {
        console.log('Reset success');
        refreshCount();
      }
    } catch (err) {
      console.error('Reset failed:', err);
    } finally {
      setTesting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>🔔 Badge Test</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600">Please authenticate to test badges</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto space-y-4"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            🔔 Badge Test
            <Badge variant={badgeApiSupported ? "default" : "secondary"}>
              {badgeApiSupported ? "API ✓" : "No API"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current Count:</span>
            <Badge variant={unreadCount > 0 ? "destructive" : "outline"}>
              {isLoading ? "..." : unreadCount}
            </Badge>
          </div>
          
          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
              Error: {error}
            </div>
          )}
          
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={handleIncrement}
              disabled={testing}
              size="sm"
              variant="default"
            >
              +1
            </Button>
            <Button
              onClick={handleDecrement}
              disabled={testing}
              size="sm"
              variant="outline"
            >
              -1
            </Button>
            <Button
              onClick={handleReset}
              disabled={testing}
              size="sm"
              variant="destructive"
            >
              Reset
            </Button>
          </div>
          
          <Button
            onClick={refreshCount}
            disabled={testing}
            size="sm"
            variant="secondary"
            className="w-full"
          >
            Refresh Count
          </Button>
          
          <div className="text-xs text-gray-500 space-y-1">
            <div>User ID: {userId?.slice(-8)}...</div>
            <div>Badge API: {badgeApiSupported ? "Supported" : "Not supported"}</div>
            <div>Status: {isLoading ? "Loading..." : "Ready"}</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default NotificationBadgeTest;