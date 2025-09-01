// © 2025 M1SSION™ NIYVORA KFT – Joseph MULÉ
/* Test VAPID Key Format M1SSION™ */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

export const VAPIDKeyTest = () => {
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testVAPIDKey = async () => {
    setIsLoading(true);
    try {
      // Test della chiave VAPID M1SSION™
      const vapidKey = 'BJMuwT6jgq_wAQIccbQKoVOeUkc4dB64CNtSicE8zegs12sHZs0Jz0itIEv2USImnhstQtw219nYydIDKr91n2o';
      
      console.log('🔑 Testing VAPID key:', vapidKey);
      console.log('🔑 Key length:', vapidKey.length);
      
      // Test if it's a valid base64url
      try {
        const padding = '='.repeat((4 - vapidKey.length % 4) % 4);
        const base64 = (vapidKey + padding)
          .replace(/-/g, '+')
          .replace(/_/g, '/');
        
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        
        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i);
        }
        
        console.log('🔑 Key decoded successfully, length:', outputArray.length);
        console.log('🔑 First few bytes:', Array.from(outputArray.slice(0, 10)));
        
        setResult({
          success: true,
          keyLength: vapidKey.length,
          decodedLength: outputArray.length,
          isValidFormat: outputArray.length === 65, // 65 bytes for uncompressed P-256 key
          firstBytes: Array.from(outputArray.slice(0, 10))
        });
        
      } catch (decodeError) {
        console.error('🔑 Key decode error:', decodeError);
        setResult({
          success: false,
          error: 'Invalid base64url format',
          details: decodeError.message
        });
      }
      
    } catch (error) {
      console.error('🔑 VAPID test error:', error);
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateNewKeys = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('vapid_generator');
      
      if (error) {
        throw error;
      }
      
      console.log('🔑 New VAPID keys generated:', data);
      setResult({
        success: true,
        newKeys: data,
        message: 'New keys generated successfully'
      });
      
    } catch (error) {
      console.error('🔑 Key generation error:', error);
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>🔑 M1SSION™ VAPID Key Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={testVAPIDKey}
            disabled={isLoading}
            variant="outline"
          >
            Test Current Key
          </Button>
          <Button 
            onClick={generateNewKeys}
            disabled={isLoading}
          >
            Generate New Keys
          </Button>
        </div>
        
        {result && (
          <div className="mt-4 p-4 bg-gray-100 rounded">
            <pre className="text-xs overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};