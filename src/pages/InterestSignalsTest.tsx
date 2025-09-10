/**
 * © 2025 Joseph MULÉ – M1SSION™ Interest Signals Test Page
 * Test the interest tracking and badge sync functionality
 */

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { trackView, trackClick, trackDwell, trackFavorite, diagnostics, type TrackingSection } from '@/metrics/interestSignals';
import { getBadgeSyncState } from '@/utils/appIconBadgeSync';

export default function InterestSignalsTest() {
  const [diagnosticState, setDiagnosticState] = useState<any>({});
  const [badgeState, setBadgeState] = useState<any>({});
  const [queueSize, setQueueSize] = useState(0);

  useEffect(() => {
    // Update diagnostics every 2 seconds
    const interval = setInterval(() => {
      try {
        setDiagnosticState({
          ...((window as any).__M1_BADGE_DIAG__ || {}),
          ...((window as any).__M1_SIG__ || {})
        });
        setBadgeState(getBadgeSyncState());
        setQueueSize(diagnostics.queueSize());
      } catch (error) {
        console.warn('Diagnostics update failed:', error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const testTrackView = (section: TrackingSection) => {
    trackView(section);
    console.log(`📊 Tracked view: ${section}`);
  };

  const testTrackClick = (category: string) => {
    trackClick(category, { test: 'true', timestamp: Date.now() });
    console.log(`📊 Tracked click: ${category}`);
  };

  const testTrackDwell = () => {
    trackDwell('Map', 5000); // 5 seconds
    console.log('📊 Tracked dwell: 5 seconds on Map');
  };

  const testTrackFavorite = () => {
    trackFavorite({ type: 'mission', id: 'test-mission-1' });
    console.log('📊 Tracked favorite: mission');
  };

  const testFlushNow = async () => {
    try {
      await diagnostics.flushNow();
      console.log('📊 Flushed interest signals queue');
    } catch (error) {
      console.error('📊 Flush failed:', error);
    }
  };

  const testBadgeAPI = async () => {
    try {
      if ((window as any).__M1_BADGE_TEST__) {
        await (window as any).__M1_BADGE_TEST__.set(7);
        console.log('🔍 Badge API test: Set to 7');
        
        setTimeout(async () => {
          await (window as any).__M1_BADGE_TEST__.clear();
          console.log('🔍 Badge API test: Cleared');
        }, 3000);
      } else {
        console.warn('🔍 Badge test helpers not available');
      }
    } catch (error) {
      console.error('🔍 Badge API test failed:', error);
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🧪 M1SSION™ Interest Signals Test</CardTitle>
          <CardDescription>
            Test interest tracking and PWA badge synchronization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {/* Interest Tracking Tests */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Interest Tracking</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Button variant="outline" onClick={() => testTrackView('Map')}>
                Track Map View
              </Button>
              <Button variant="outline" onClick={() => testTrackView('Intel')}>
                Track Intel View
              </Button>
              <Button variant="outline" onClick={() => testTrackView('Notice')}>
                Track Notice View
              </Button>
              <Button variant="outline" onClick={() => testTrackView('Rewards')}>
                Track Rewards View
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
              <Button variant="outline" onClick={() => testTrackClick('mission')}>
                Track Mission Click
              </Button>
              <Button variant="outline" onClick={() => testTrackClick('brand')}>
                Track Brand Click
              </Button>
              <Button variant="outline" onClick={testTrackDwell}>
                Track Dwell (5s)
              </Button>
              <Button variant="outline" onClick={testTrackFavorite}>
                Track Favorite
              </Button>
            </div>
          </div>

          {/* Queue Management */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Queue Management</h3>
            <div className="flex gap-2 items-center">
              <Button onClick={testFlushNow}>
                Flush Queue Now
              </Button>
              <span className="text-sm text-muted-foreground">
                Queue size: {queueSize} events
              </span>
            </div>
          </div>

          {/* Badge API Tests */}
          <div>
            <h3 className="text-lg font-semibold mb-2">PWA Badge API</h3>
            <Button onClick={testBadgeAPI}>
              Test Badge API (Set 7, then clear)
            </Button>
          </div>

          {/* Diagnostics Display */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Diagnostics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Badge State */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Badge Sync State</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                    {JSON.stringify(badgeState, null, 2)}
                  </pre>
                </CardContent>
              </Card>

              {/* Interest Signals State */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Interest Signals State</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                    {JSON.stringify(diagnosticState, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Environment Info */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Environment</h3>
            <Card>
              <CardContent className="pt-4">
                <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                  {JSON.stringify({
                    userAgent: navigator.userAgent.substring(0, 120),
                    standalone: window.matchMedia('(display-mode: standalone)').matches,
                    protocol: window.location.protocol,
                    hasSetAppBadge: 'setAppBadge' in navigator,
                    hasClearAppBadge: 'clearAppBadge' in navigator,
                    debugMode: import.meta.env.VITE_DIAG === '1' || import.meta.env.VITE_BADGE_DEBUG === '1'
                  }, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}