import { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth";
import { DynamicIslandProvider } from "@/contexts/DynamicIslandContext";
import { MissionProvider } from "@/contexts/MissionContext";
import Index from "./pages/Index";
import MapPage from "./pages/map/MapPage";
import Buzz from "./pages/Buzz";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DynamicIslandProvider>
        <MissionProvider>
          <TooltipProvider>
            <Toaster />
            <BrowserRouter>
              <div className="min-h-screen bg-background font-sans antialiased">
                <Suspense fallback={<div>Loading...</div>}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/buzz" element={<Buzz />} />
                    <Route path="/map" element={<MapPage />} />
                  </Routes>
                </Suspense>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </MissionProvider>
      </DynamicIslandProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
