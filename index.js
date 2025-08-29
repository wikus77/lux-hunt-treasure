// M1SSION Push Notification Server (ESM)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import subscribeHandler from './api/push/subscribe.js';
import sendHandler from './api/push/send.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['https://m1ssion.eu', 'https://www.m1ssion.eu', 'http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    service: 'M1SSION Push API'
  });
});

// Push notification endpoints
app.use('/api/push/subscribe', subscribeHandler);
app.use('/api/push/send', sendHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 M1SSION Push API running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`📮 Subscribe endpoint: http://localhost:${PORT}/api/push/subscribe`);
  console.log(`📤 Send endpoint: http://localhost:${PORT}/api/push/send`);
  
  // Check required env vars
  const requiredEnvs = ['VAPID_PUBLIC', 'VAPID_PRIVATE'];
  const missing = requiredEnvs.filter(env => !process.env[env]);
  
  if (missing.length > 0) {
    console.warn(`⚠️  Missing environment variables: ${missing.join(', ')}`);
    console.warn('   Set these in your .env file for push notifications to work');
  } else {
    console.log('✅ All required environment variables configured');
  }
});