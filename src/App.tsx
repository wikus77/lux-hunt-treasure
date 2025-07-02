
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/auth";
import { DynamicIslandProvider } from "@/contexts/DynamicIslandContext";
import { MissionProvider } from "@/contexts/MissionContext";
import Index from "./pages/Index";
import MapPage from "./pages/map/MapPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DynamicIslandProvider>
        <MissionProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/map" element={<MapPage />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </MissionProvider>
      </DynamicIslandProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
