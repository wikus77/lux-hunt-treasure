// POST /api/push/send - Send push notification
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://vkjrqirvdvjbemsfzxof.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk'
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
    const { endpoint, p256dh, auth, payload } = req.body;
    
    if (!endpoint || !p256dh || !auth) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (!process.env.VAPID_PUBLIC || !process.env.VAPID_PRIVATE) {
      return res.status(500).json({ error: 'VAPID keys not configured' });
    }
    
    const subscription = {
      endpoint,
      keys: { p256dh, auth }
    };
    
    const defaultPayload = {
      title: 'M1SSION™',
      body: 'Ping',
      link: 'https://m1ssion.eu/'
    };
    
    const notificationPayload = JSON.stringify(payload || defaultPayload);
    
    try {
      const result = await webpush.sendNotification(
        subscription,
        notificationPayload,
        { TTL: 300 }
      );
      
      res.json({ 
        ok: true, 
        status: result.statusCode || 200 
      });
      
    } catch (error) {
      console.error('Push send error:', error);
      
      // If subscription is invalid (404/410), remove from database
      if (error.statusCode === 404 || error.statusCode === 410) {
        const { error: deleteError } = await supabase
          .from('push_subscriptions')
          .delete()
          .eq('endpoint', endpoint);
        
        if (deleteError) {
          console.error('Failed to delete invalid subscription:', deleteError);
        }
        
        return res.status(410).json({ 
          ok: false, 
          status: error.statusCode,
          error: 'Subscription no longer valid',
          removed: true
        });
      }
      
      res.status(500).json({ 
        ok: false, 
        status: error.statusCode || 500,
        error: 'Failed to send notification' 
      });
    }
    
  } catch (err) {
    console.error('Send handler error:', err);
    res.status(400).json({ error: err.message });
  }
}