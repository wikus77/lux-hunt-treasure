/**
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 * M1SSION™ Main Application Component
 */

import { BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/components/ThemeProvider';
import WouterRoutes from './routes/WouterRoutes';

const App = () => {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Router>
          <Sonner />
          <Toaster />
          <WouterRoutes />
        </Router>
      </TooltipProvider>
    </ThemeProvider>
  );
};

export default App;
