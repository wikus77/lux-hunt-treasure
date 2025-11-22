# 🕵️ M1SSION™ - Elite Treasure Hunt App

**🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™**

## 📱 Project Overview

M1SSION™ is an elite treasure hunting application featuring:
- 🗺️ Interactive BUZZ MAP with dynamic geolocation
- 🎯 Real-time treasure hunting with premium subscriptions
- 🎮 Mini-games and interactive challenges
- 💳 Integrated Stripe payments (Silver, Gold, Black tiers)
- 📱 Native iOS compatibility via Capacitor
- 🔔 Push notifications with Dynamic Island support

## 🛠 Technologies Used

- **Frontend**: React + TypeScript + Vite
- **UI Framework**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Database, Auth, Edge Functions)
- **Mobile**: Capacitor for iOS native compatibility
- **Payments**: Stripe Integration (Live Mode)
- **Notifications**: Firebase FCM + Dynamic Island
- **Maps**: Leaflet with custom M1SSION™ styling

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- iOS development: Xcode 14+ (for iOS builds)

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd m1ssion-app

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### 📱 iOS Capacitor Build

```bash
# Add iOS platform
npx cap add ios

# Sync with native project
npx cap sync

# Open in Xcode
npx cap open ios
```

## 🎯 Core Features

### 🗺️ BUZZ MAP System
- Dynamic area generation based on subscription tier
- Real-time geolocation with proximity detection
- Premium clue generation and discovery
- Dynamic pricing based on weekly usage

### 💳 Subscription Tiers
- **Silver**: €3.99/month - Basic features
- **Gold**: €6.99/month - Enhanced capabilities  
- **Black**: €9.99/month - VIP access with exclusive events

### 🎮 Mini-Games
- Crack the Combination
- Disarm the Bomb
- Satellite Tracking
- Flash Interrogation
- Find Map Point

## 🔐 Security & Architecture

- **Row Level Security (RLS)** on all Supabase tables
- **JWT Authentication** with secure session management
- **Encrypted payment processing** via Stripe
- **GDPR Compliant** data handling
- **Secure API endpoints** with abuse protection

## 📱 iOS Features

- Dynamic Island integration for live activities
- Push notifications with custom categories
- Native iOS gestures and safe area handling
- Offline capability for core features
- App Store ready configuration

## 🔧 Configuration

All environment variables and secrets are managed through:
- Supabase Edge Function secrets
- Capacitor native configuration
- Firebase project settings

### 🔄 Supabase Migration (Post-Remix)

**IMPORTANT**: If you need to disconnect from Lovable Cloud and connect to your own Supabase instance:

1. **See the full guide**: `SUPABASE_MIGRATION_GUIDE.md`
2. **Test your connection**: Navigate to `/supabase-test` after migration
3. **Verify diagnostics**: Check `/diag-supabase` for singleton status

The codebase is now **environment-agnostic** and uses only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` variables, which are automatically populated by Lovable after reconnecting to your Supabase project.

### Norah AI E2E Testing (Dev Only)

Test the complete Norah pipeline with curl:

```bash
# Set your base URL
BASE="${VITE_NORAH_BASE_URL:?set VITE_NORAH_BASE_URL}"

# 1. Ingest sample documents
curl -sS -X POST "$BASE/norah-ingest" -H "Content-Type: application/json" --data '{
  "documents":[
    {"docId":"dev-1","source":"panel","text":"M1SSION Push SAFE Guard overview.","tags":["test","guard"]},
    {"docId":"dev-2","source":"panel","text":"Buzz Map pricing tiers…","tags":["buzz","pricing"]},
    {"docId":"dev-3","source":"panel","text":"Norah flow ingest->embed->search KPIs","tags":["rag","flow"]}
  ],
  "dryRun":false
}'

# 2. Generate embeddings (two batches)
curl -sS -X POST "$BASE/norah-embed" -H "Content-Type: application/json" --data '{"batch":5}'
curl -sS -X POST "$BASE/norah-embed" -H "Content-Type: application/json" --data '{"batch":20}'

# 3. RAG search (POST only)
curl -sS -X POST "$BASE/norah-rag-search" -H "Content-Type: application/json" --data '{"q":"Push SAFE Guard"}'

# 4. Check KPIs
curl -sS "$BASE/norah-kpis"
```

## 📞 Support & Contact

For technical support or business inquiries:
- **CEO**: Joseph Mulè
- **Company**: Niyvora KFT™
- **Email**: [Contact through app]

---

## 📄 License & Ownership

**© 2025 NIYVORA KFT™ - All Rights Reserved**

This project and all its components are the exclusive property of Joseph Mulè and Niyvora KFT™. Unauthorized copying, distribution, or modification is strictly prohibited.

**🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™**