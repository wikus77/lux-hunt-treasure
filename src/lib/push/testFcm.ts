/* M1SSION™ AG-X0197 */
// Test utility for FCM implementation
import { getFcmToken } from './getFcmToken';
import { supabase } from '@/integrations/supabase/client';

/**
 * Test the complete FCM flow - for console testing
 */
export async function testFcmFlow() {
  try {
    console.log('🔔 M1SSION™ FCM Test Started');
    
    // Step 1: Generate token
    console.log('1. Generating FCM token...');
    const result = await getFcmToken();
    
    if (!result.success) {
      console.error('❌ Token generation failed:', result.error);
      return { success: false, error: result.error };
    }
    
    console.log('✅ Token generated:', result.token?.substring(0, 30) + '...');
    
    // Step 2: Save to database (if user is logged in)
    const { data: { user } } = await supabase.auth.getUser();
    if (user && result.token) {
      console.log('2. Saving token to database...');
      
      const { error } = await supabase
        .from('push_tokens')
        .upsert({
          user_id: user.id,
          token: result.token,
          ua: navigator.userAgent
        });
        
      if (error) {
        console.error('❌ Database save failed:', error);
      } else {
        console.log('✅ Token saved to database');
      }
    }
    
    // Step 3: Test push notification
    console.log('3. Testing push notification...');
    
    const pushResult = await supabase.functions.invoke('send-push', {
      body: {
        token: result.token,
        title: 'M1SSION™ Test',
        body: 'FCM implementation working correctly!',
        data: { test: true }
      }
    });
    
    if (pushResult.error) {
      console.error('❌ Push test failed:', pushResult.error);
      return { success: false, error: pushResult.error.message };
    }
    
    console.log('✅ Push notification sent successfully');
    console.log('🎉 M1SSION™ FCM Test Completed Successfully');
    
    return { 
      success: true, 
      token: result.token,
      pushResponse: pushResult.data 
    };
    
  } catch (error: any) {
    console.error('❌ FCM Test failed:', error);
    return { success: false, error: error.message };
  }
}

// Make it available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).testFcmFlow = testFcmFlow;
  console.log('🔧 FCM Test available as: window.testFcmFlow()');
}