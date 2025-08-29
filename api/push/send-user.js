// POST /api/push/send-user - Send push notification to all user's subscriptions
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://vkjrqirvdvjbemsfzxof.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk'
);

// Set VAPID details
if (process.env.VAPID_PUBLIC && process.env.VAPID_PRIVATE) {
  webpush.setVapidDetails(
    'mailto:novaearch@hotmail.com',
    process.env.VAPID_PUBLIC,
    process.env.VAPID_PRIVATE
  );
}

export default async function handler(req, res) {
  // CORS headers - restrict to allowed origins
  const allowedOrigins = process.env.ALLOW_ORIGINS?.split(',') || ['https://m1ssion.eu', 'https://www.m1ssion.eu', 'http://localhost:3000'];
  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, payload } = req.body;
    
    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }
    
    if (!process.env.VAPID_PUBLIC || !process.env.VAPID_PRIVATE) {
      return res.status(500).json({ error: 'VAPID keys not configured' });
    }

    // Get all subscriptions for this user
    const { data: subscriptions, error: fetchError } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth')
      .eq('user_id', user_id);

    if (fetchError) {
      console.error('Error fetching subscriptions:', fetchError);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!subscriptions || subscriptions.length === 0) {
      return res.status(404).json({ error: 'No subscriptions found for user' });
    }

    const defaultPayload = {
      title: 'M1SSION™',
      body: 'Ping',
      link: 'https://m1ssion.eu/'
    };
    
    const notificationPayload = JSON.stringify(payload || defaultPayload);
    
    const results = [];
    const failedEndpoints = [];

    // Send to all user subscriptions
    for (const sub of subscriptions) {
      const subscription = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth }
      };

      try {
        const result = await webpush.sendNotification(
          subscription,
          notificationPayload,
          { TTL: 300 }
        );
        
        results.push({
          endpoint: sub.endpoint,
          success: true,
          status: result.statusCode || 200
        });
        
      } catch (error) {
        console.error(`Push send error for ${sub.endpoint}:`, error);
        
        results.push({
          endpoint: sub.endpoint,
          success: false,
          status: error.statusCode || 500,
          error: error.message
        });

        // If subscription is invalid (404/410), mark for deletion
        if (error.statusCode === 404 || error.statusCode === 410) {
          failedEndpoints.push(sub.endpoint);
        }
      }
    }

    // Clean up failed subscriptions
    if (failedEndpoints.length > 0) {
      const { error: deleteError } = await supabase
        .from('push_subscriptions')
        .delete()
        .in('endpoint', failedEndpoints);
        
      if (deleteError) {
        console.error('Failed to delete invalid subscriptions:', deleteError);
      }
    }

    const successCount = results.filter(r => r.success).length;
    const totalCount = results.length;

    res.json({
      ok: true,
      results,
      summary: {
        total: totalCount,
        success: successCount,
        failed: totalCount - successCount,
        removed: failedEndpoints.length
      }
    });
    
  } catch (err) {
    console.error('Send user handler error:', err);
    res.status(400).json({ error: err.message });
  }
}