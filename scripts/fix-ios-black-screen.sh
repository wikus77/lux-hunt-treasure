#!/bin/bash
# 🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™
# M1SSION™ - Fix iOS Black Screen - Eliminazione doppia inizializzazione Capacitor

echo "🚨 FIXING iOS BLACK SCREEN - M1SSION™"
echo "=================================================="

# 1. Backup files originali
echo "📁 Creating backup of critical files..."
mkdir -p ios-backup
cp src/main.tsx ios-backup/main.tsx.backup 2>/dev/null
cp src/App.tsx ios-backup/App.tsx.backup 2>/dev/null

# 2. Fix main.tsx - Rimuovi inizializzazione Capacitor duplicata
echo "🔧 Fixing main.tsx - Removing duplicate Capacitor initialization..."
cat > src/main.tsx << 'EOF'
import React from 'react';
import ReactDOM from 'react-dom/client';
import * as Sentry from "@sentry/react";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './index.css';
import { Toaster } from 'sonner';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

// Simple render function - NO CAPACITOR INIT HERE
const renderApp = () => {
  console.log("🚀 M1SSION APP STARTING - Single initialization");
  
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    console.error("❌ Root element not found!");
    return;
  }
  
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <App />
        <Toaster position="top-right" richColors closeButton />
      </QueryClientProvider>
    </React.StrictMode>
  );
  
  console.log("✅ M1SSION APP MOUNTED");
};

// DOM ready check
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}
EOF

# 3. Fix App.tsx - Ottimizza inizializzazione
echo "🔧 Fixing App.tsx - Optimizing Capacitor initialization..."
cat > src/App.tsx << 'EOF'
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from "sonner";
import { AuthProvider } from "./contexts/auth/AuthProvider";
import { SoundProvider } from "./contexts/SoundContext";
import { ErrorBoundary } from "./components/error/ErrorBoundary";
import AppRoutes from "./routes/AppRoutes";
import { SafeAreaToggle } from "./components/debug/SafeAreaToggle";
import ProductionSafety from "./components/debug/ProductionSafety";
import { initializeCapacitorWithExplicitName, detectCapacitorEnvironment } from "./utils/capacitor";

function App() {
  console.log("🚀 M1SSION App rendering - SINGLE INIT");
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        console.log("🔄 M1SSION initialization starting...");
        
        if (detectCapacitorEnvironment()) {
          console.log("📱 Capacitor detected - initializing once...");
          await initializeCapacitorWithExplicitName();
        }
        
        // Short delay for iOS stability
        await new Promise(resolve => setTimeout(resolve, 500));
        setAppReady(true);
        console.log("✅ M1SSION ready");
        
      } catch (error) {
        console.error("❌ Init error:", error);
        setAppReady(true); // Continue anyway
      }
    };

    initializeApp();
  }, []);

  if (!appReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p>M1SSION Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <ErrorBoundary>
      <ProductionSafety>
        <Router>
          <SoundProvider>
            <AuthProvider>
              <SafeAreaToggle>
                <AppRoutes />
                <Toaster position="top-center" richColors closeButton />
              </SafeAreaToggle>
            </AuthProvider>
          </SoundProvider>
        </Router>
      </ProductionSafety>
    </ErrorBoundary>
  );
}

export default App;
EOF

# 4. Fix Capacitor initialization - Single call
echo "🔧 Optimizing Capacitor initialization..."
cat > src/utils/capacitor/initialization.ts << 'EOF'
// M1SSION™ - Single Capacitor Initialization
import { preserveFunctionName, detectCapacitorEnvironment } from './core';
import { applySafeAreaStyles } from './styles';

const SPLASH_TIMEOUT = 2000; // Reduced timeout

export const initializeCapacitorWithExplicitName = preserveFunctionName(
  async () => {
    if (!detectCapacitorEnvironment()) {
      console.log('📱 Web environment - Capacitor not needed');
      return true;
    }
    
    console.log('📱 SINGLE Capacitor initialization starting...');
    
    try {
      const { SplashScreen, StatusBar, Keyboard } = (window as any).Capacitor;
      
      // Quick status bar setup
      if (StatusBar) {
        await StatusBar.setStyle({ style: 'dark' });
        await StatusBar.setBackgroundColor({ color: '#000000' });
      }
      
      // Quick keyboard setup
      if (Keyboard) {
        await Keyboard.setAccessoryBarVisible({ isVisible: false });
      }
      
      // Apply safe area
      applySafeAreaStyles();
      
      // Hide splash screen - SINGLE CALL
      if (SplashScreen) {
        setTimeout(async () => {
          try {
            await SplashScreen.hide();
            console.log('✅ Splash hidden successfully');
          } catch (e) {
            console.warn('⚠️ Splash hide warning:', e);
          }
        }, SPLASH_TIMEOUT);
      }
      
      console.log('✅ Capacitor ready');
      return true;
      
    } catch (error) {
      console.error('❌ Capacitor error:', error);
      return false;
    }
  },
  'initializeCapacitorWithExplicitName'
);
EOF

# 5. Rebuild and sync
echo "🔨 Rebuilding and syncing..."
npm run build
npx cap sync ios

echo ""
echo "✅ FIX COMPLETED!"
echo "=================================================="
echo "🎯 Changes made:"
echo "   - Removed duplicate Capacitor initialization from main.tsx"
echo "   - Simplified App.tsx initialization"
echo "   - Optimized Capacitor splash screen handling"
echo "   - Reduced loading timeouts"
echo ""
echo "📱 Next steps:"
echo "   1. npx cap open ios"
echo "   2. Build and run on device"
echo "   3. App should now show content instead of black screen"
echo ""
echo "🔐 FIRMATO: BY JOSEPH MULÈ — CEO di NIYVORA KFT™"