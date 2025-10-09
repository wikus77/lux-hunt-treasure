// © 2025 M1SSION™ – NIYVORA KFT – Joseph MULÉ
// Firebase Push Notification Comprehensive Report Generator

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ReportSection {
  title: string;
  status: 'pass' | 'fail' | 'warning' | 'info';
  details: string[];
  recommendations?: string[];
}

export const FirebaseNotificationReport = () => {
  const [report, setReport] = useState<ReportSection[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const generateComprehensiveReport = async () => {
    setIsGenerating(true);
    const reportSections: ReportSection[] = [];

    try {
      // 1. FCM Infrastructure Analysis
      const fcmInfrastructure: ReportSection = {
        title: '🔧 FCM Infrastructure',
        status: 'info',
        details: [],
        recommendations: []
      };

      // Check if service worker is registered
      try {
        const swRegistration = await navigator.serviceWorker.getRegistration();
        if (swRegistration) {
          fcmInfrastructure.details.push('✅ Service Worker registered and active');
          fcmInfrastructure.status = 'pass';
        } else {
          fcmInfrastructure.details.push('❌ Service Worker not registered');
          fcmInfrastructure.status = 'fail';
          fcmInfrastructure.recommendations?.push('Register Firebase messaging service worker');
        }
      } catch (error) {
        fcmInfrastructure.details.push(`❌ Service Worker check failed: ${error.message}`);
        fcmInfrastructure.status = 'fail';
      }

      // Check notification permission
      const permission = Notification.permission;
      if (permission === 'granted') {
        fcmInfrastructure.details.push('✅ Notification permission granted');
      } else if (permission === 'denied') {
        fcmInfrastructure.details.push('❌ Notification permission denied');
        fcmInfrastructure.status = 'fail';
        fcmInfrastructure.recommendations?.push('User must manually enable notifications in browser settings');
      } else {
        fcmInfrastructure.details.push('⚠️ Notification permission not requested');
        fcmInfrastructure.status = 'warning';
        fcmInfrastructure.recommendations?.push('Request notification permission from user');
      }

      reportSections.push(fcmInfrastructure);

      // 2. Database Token Analysis
      const tokenAnalysis: ReportSection = {
        title: '🗃️ Database Token Analysis',
        status: 'info',
        details: [],
        recommendations: []
      };

      try {
        const { data: allTokens } = await supabase
          .from('user_push_tokens')
          .select('*');

        const { data: activeTokens } = await supabase
          .from('user_push_tokens')
          .select('*')
          .eq('is_active', true);

        const { data: currentUser } = await supabase.auth.getUser();
        const { data: userTokens } = await supabase
          .from('user_push_tokens')
          .select('*')
          .eq('user_id', currentUser.user?.id)
          .eq('is_active', true);

        tokenAnalysis.details.push(`📊 Total tokens in database: ${allTokens?.length || 0}`);
        tokenAnalysis.details.push(`✅ Active tokens: ${activeTokens?.length || 0}`);
        tokenAnalysis.details.push(`👤 Current user active tokens: ${userTokens?.length || 0}`);

        if (userTokens && userTokens.length > 0) {
          tokenAnalysis.status = 'pass';
          tokenAnalysis.details.push('✅ Current user has valid FCM tokens');
        } else {
          tokenAnalysis.status = 'fail';
          tokenAnalysis.details.push('❌ Current user has no FCM tokens');
          tokenAnalysis.recommendations?.push('User must activate push notifications to generate FCM token');
        }

      } catch (error) {
        tokenAnalysis.details.push(`❌ Database query failed: ${error.message}`);
        tokenAnalysis.status = 'fail';
      }

      reportSections.push(tokenAnalysis);

      // 3. Edge Function Analysis
      const edgeFunctionAnalysis: ReportSection = {
        title: '⚡ Edge Function Analysis',
        status: 'info',
        details: [],
        recommendations: []
      };

      try {
        // Test edge function accessibility
        const { data: testResponse, error: testError } = await supabase.functions.invoke('send-firebase-push', {
          body: { test: true }
        });

        if (testError) {
          edgeFunctionAnalysis.details.push(`❌ Edge function error: ${testError.message}`);
          edgeFunctionAnalysis.status = 'fail';
          edgeFunctionAnalysis.recommendations?.push('Check edge function deployment and configuration');
        } else {
          edgeFunctionAnalysis.details.push('✅ Edge function accessible');
          edgeFunctionAnalysis.status = 'pass';
        }

        // Check recent edge function logs
        const { data: recentLogs } = await supabase
          .from('admin_logs')
          .select('*')
          .eq('event_type', 'firebase_push_notification_sent')
          .order('created_at', { ascending: false })
          .limit(10);

        edgeFunctionAnalysis.details.push(`📋 Recent FCM logs: ${recentLogs?.length || 0}`);

        if (recentLogs && recentLogs.length > 0) {
          const latestLog = recentLogs[0];
          edgeFunctionAnalysis.details.push(`🕒 Last notification: ${new Date(latestLog.created_at).toLocaleString()}`);
          
          // Note: admin_logs table structure doesn't include details field
          edgeFunctionAnalysis.details.push(`📝 Log note: ${latestLog.note || 'No note'}`);
        } else {
          edgeFunctionAnalysis.details.push('⚠️ No recent FCM activity logged');
          edgeFunctionAnalysis.status = 'warning';
          edgeFunctionAnalysis.recommendations?.push('Test sending a notification to verify logging');
        }

      } catch (error) {
        edgeFunctionAnalysis.details.push(`❌ Edge function analysis failed: ${error.message}`);
        edgeFunctionAnalysis.status = 'fail';
      }

      reportSections.push(edgeFunctionAnalysis);

      // 4. Firebase Configuration Analysis
      const firebaseConfigAnalysis: ReportSection = {
        title: '🔥 Firebase Configuration',
        status: 'info',
        details: [],
        recommendations: []
      };

      // Check if Firebase SDK is loaded
      try {
        const { getFCMToken } = await import('@/lib/firebase');
        firebaseConfigAnalysis.details.push('✅ Firebase SDK loaded successfully');
        
        // Try to get FCM token
        const token = await getFCMToken();
        if (token) {
          firebaseConfigAnalysis.details.push('✅ FCM token generated successfully');
          firebaseConfigAnalysis.details.push(`📱 Token length: ${token.length} characters`);
          firebaseConfigAnalysis.status = 'pass';
        } else {
          firebaseConfigAnalysis.details.push('❌ FCM token generation failed');
          firebaseConfigAnalysis.status = 'fail';
          firebaseConfigAnalysis.recommendations?.push('Check Firebase configuration and VAPID key');
        }
      } catch (error) {
        firebaseConfigAnalysis.details.push(`❌ Firebase SDK error: ${error.message}`);
        firebaseConfigAnalysis.status = 'fail';
        firebaseConfigAnalysis.recommendations?.push('Check Firebase SDK installation and configuration');
      }

      reportSections.push(firebaseConfigAnalysis);

      // 5. Browser Compatibility Analysis
      const browserAnalysis: ReportSection = {
        title: '🌐 Browser Compatibility',
        status: 'info',
        details: [],
        recommendations: []
      };

      browserAnalysis.details.push(`🖥️ User Agent: ${navigator.userAgent}`);
      browserAnalysis.details.push(`📱 Platform: ${navigator.platform}`);
      
      const isServiceWorkerSupported = 'serviceWorker' in navigator;
      const isNotificationSupported = 'Notification' in window;
      const isPushSupported = 'PushManager' in window;

      browserAnalysis.details.push(`Service Worker: ${isServiceWorkerSupported ? '✅' : '❌'}`);
      browserAnalysis.details.push(`Notifications: ${isNotificationSupported ? '✅' : '❌'}`);
      browserAnalysis.details.push(`Push Manager: ${isPushSupported ? '✅' : '❌'}`);

      if (isServiceWorkerSupported && isNotificationSupported && isPushSupported) {
        browserAnalysis.status = 'pass';
        browserAnalysis.details.push('✅ Browser fully supports FCM');
      } else {
        browserAnalysis.status = 'fail';
        browserAnalysis.details.push('❌ Browser has limited FCM support');
        browserAnalysis.recommendations?.push('Use a modern browser with full FCM support');
      }

      // Safari iOS specific checks
      if (navigator.userAgent.includes('Safari') && navigator.userAgent.includes('Mobile')) {
        browserAnalysis.details.push('📱 Safari iOS detected');
        browserAnalysis.details.push('ℹ️ PWA must be installed for notifications to work');
        browserAnalysis.recommendations?.push('Ensure app is added to home screen on iOS Safari');
      }

      reportSections.push(browserAnalysis);

      setReport(reportSections);
      toast.success('Comprehensive report generated successfully!');

    } catch (error) {
      console.error('❌ Report generation failed:', error);
      toast.error(`Report generation failed: ${error.message}`);
    }

    setIsGenerating(false);
  };

  const getStatusColor = (status: ReportSection['status']) => {
    switch (status) {
      case 'pass': return 'text-green-600 bg-green-50';
      case 'fail': return 'text-red-600 bg-red-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      case 'info': return 'text-blue-600 bg-blue-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: ReportSection['status']) => {
    switch (status) {
      case 'pass': return '✅';
      case 'fail': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '❓';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          📋 Firebase Push Notification System Report
          <Badge variant="outline" className="bg-primary/10">
            Comprehensive Analysis
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={generateComprehensiveReport}
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? 'Generating Report...' : '📊 Generate Comprehensive Report'}
        </Button>

        {report.length > 0 && (
          <div className="space-y-4 mt-6">
            <h3 className="text-lg font-semibold">📄 Diagnostic Report</h3>
            
            {report.map((section, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getStatusColor(section.status)}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{getStatusIcon(section.status)}</span>
                  <h4 className="font-semibold">{section.title}</h4>
                  <Badge variant={section.status === 'pass' ? 'default' : 'destructive'}>
                    {section.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="space-y-1 mb-3">
                  {section.details.map((detail, detailIndex) => (
                    <div key={detailIndex} className="text-sm font-mono">
                      {detail}
                    </div>
                  ))}
                </div>

                {section.recommendations && section.recommendations.length > 0 && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <h5 className="font-medium text-yellow-800 mb-2">💡 Recommendations:</h5>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      {section.recommendations.map((rec, recIndex) => (
                        <li key={recIndex} className="flex items-start gap-2">
                          <span>•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">📝 Report Summary</h4>
              <div className="text-sm text-blue-700">
                <p><strong>Generated:</strong> {new Date().toLocaleString()}</p>
                <p><strong>Total Sections:</strong> {report.length}</p>
                <p><strong>Passed:</strong> {report.filter(r => r.status === 'pass').length}</p>
                <p><strong>Failed:</strong> {report.filter(r => r.status === 'fail').length}</p>
                <p><strong>Warnings:</strong> {report.filter(r => r.status === 'warning').length}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};