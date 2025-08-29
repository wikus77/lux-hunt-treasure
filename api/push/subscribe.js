// POST /api/push/subscribe - Register push subscription
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || 'https://vkjrqirvdvjbemsfzxof.supabase.co',
  process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZranJxaXJ2ZHZqYmVtc2Z6eG9mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUwMzQyMjYsImV4cCI6MjA2MDYxMDIyNn0.rb0F3dhKXwb_110--08Jsi4pt_jx-5IWwhi96eYMxBk'
);

// Validate base64url and length
function validateKey(keyStr, expectedBytes, name) {
  if (!keyStr) throw new Error(`${name} is required`);
  
  // Convert base64url to base64
  const base64 = keyStr.replace(/-/g, '+').replace(/_/g, '/');
  const padding = '='.repeat((4 - base64.length % 4) % 4);
  
  try {
    const decoded = Buffer.from(base64 + padding, 'base64');
    if (decoded.length !== expectedBytes) {
      throw new Error(`${name} must be ${expectedBytes} bytes`);
    }
    return true;
  } catch (err) {
    throw new Error(`Invalid ${name} format`);
  }
}

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const { endpoint, keys, ua, userId } = req.body;
    
    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate key lengths
    validateKey(keys.p256dh, 65, 'p256dh');
    validateKey(keys.auth, 16, 'auth');
    
    // Upsert subscription
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        endpoint,
        user_id: userId || null,
        p256dh: keys.p256dh,
        auth: keys.auth,
        ua: ua || null
      }, {
        onConflict: 'endpoint'
      });
    
    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ error: 'Database error' });
    }
    
    res.json({ ok: true });
    
  } catch (err) {
    console.error('Subscribe error:', err);
    res.status(400).json({ error: err.message });
  }
}