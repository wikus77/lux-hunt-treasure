# M1SSION™ Product Overview

M1SSION is an innovative location-based treasure hunt experience that combines cutting-edge technology with real-world exploration. Built on a modern web stack with progressive web app (PWA) capabilities, M1SSION delivers a seamless cross-platform experience.

## Core Features

### Geolocation Gaming
The app uses advanced geolocation APIs to create immersive treasure hunt experiences. Players receive clues and must navigate to specific locations to progress through missions.

### Push Notifications
M1SSION implements a sophisticated push notification system that works across iOS and Android via Web Push standards. The system includes:
- FCM (Firebase Cloud Messaging) for Android
- APNs (Apple Push Notification service) for iOS PWA
- Intelligent notification scheduling with quiet hours
- Rate limiting and user preference management

### Norah AI Assistant
Norah is M1SSION's intelligent AI assistant powered by advanced language models and RAG (Retrieval-Augmented Generation) technology. Norah can:
- Answer questions about the game mechanics
- Provide contextual help based on user progress
- Offer personalized recommendations
- Learn from user interactions to improve assistance

### Subscription Tiers
M1SSION offers multiple subscription tiers:
- **Base**: Free tier with limited features
- **Silver**: Early access and enhanced features
- **Gold**: Premium experience with priority support
- **Black**: VIP tier with exclusive content
- **Titanium**: Ultimate tier with all features unlocked

### Security & Privacy
Security is paramount in M1SSION. The app implements:
- Row-Level Security (RLS) on all database operations
- Secure token management with no client-side secrets
- HTTPS-only communication
- GDPR-compliant data handling
- User consent management for data collection

## Technical Architecture

M1SSION is built on:
- **Frontend**: React with TypeScript, Tailwind CSS for styling
- **Backend**: Supabase (PostgreSQL database, Edge Functions)
- **Real-time**: Supabase Realtime for live updates
- **Storage**: Supabase Storage for user-generated content
- **AI**: OpenAI GPT models with custom RAG implementation

The app follows modern development practices including:
- Continuous deployment with automated testing
- Environment-based configuration
- Modular component architecture
- Performance optimization with code splitting
