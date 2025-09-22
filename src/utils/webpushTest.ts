// WebPush Test Utilities for M1SSION™
// Test the webpush-send function with real data

const PROJECT_REF = 'vkjrqirvdvjbemsfzxof';
const FUNCTIONS_URL = `https://${PROJECT_REF}.functions.supabase.co`;
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk';

export interface WebPushTestResult {
  success: boolean;
  status: number;
  data?: any;
  error?: string;
  timestamp: string;
}

export async function testWebPushHealth(): Promise<WebPushTestResult> {
  console.log('🔍 Testing webpush-send health endpoint...');
  
  try {
    const response = await fetch(`${FUNCTIONS_URL}/webpush-send/health`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      }
    });
    
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { rawResponse: text };
    }
    
    return {
      success: response.ok,
      status: response.status,
      data,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    return {
      success: false,
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

export async function testWebPushWithSubscriptions(subscriptions: any[]): Promise<WebPushTestResult> {
  console.log('🔍 Testing webpush-send with subscriptions...');
  
  const payload = {
    title: "M1SSION™ Test ✅",
    body: "Push notification system test - catena blindata ripristinata!",
    url: "https://m1ssion.eu/home"
  };
  
  try {
    const response = await fetch(`${FUNCTIONS_URL}/webpush-send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        subscriptions,
        payload
      })
    });
    
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { rawResponse: text };
    }
    
    return {
      success: response.ok,
      status: response.status,
      data,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    return {
      success: false,
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

export async function testWebPushWithUserIds(userIds: string[]): Promise<WebPushTestResult> {
  console.log('🔍 Testing webpush-send with user_ids...');
  
  const payload = {
    title: "M1SSION™ User Test ✅",
    body: "Push notification system test via user_ids - catena blindata ripristinata!",
    url: "https://m1ssion.eu/home"
  };
  
  try {
    const response = await fetch(`${FUNCTIONS_URL}/webpush-send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        user_ids: userIds,
        payload
      })
    });
    
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { rawResponse: text };
    }
    
    return {
      success: response.ok,
      status: response.status,
      data,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    return {
      success: false,
      status: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}

export function formatTestResult(result: WebPushTestResult): string {
  const status = result.success ? '✅ SUCCESS' : '❌ FAILED';
  const details = result.data ? JSON.stringify(result.data, null, 2) : result.error;
  
  return `${status} (${result.status}) at ${result.timestamp}\n${details}`;
}