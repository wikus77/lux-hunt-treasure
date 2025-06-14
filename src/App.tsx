
import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UnifiedAuthProvider } from "@/contexts/auth/UnifiedAuthProvider";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Lazy load pages
const Index = lazy(() => import("@/pages/Index"));
const Home = lazy(() => import("@/pages/Home"));
const Login = lazy(() => import("@/pages/Login"));

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <UnifiedAuthProvider>
            <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center">
              <div className="text-white">Caricamento...</div>
            </div>}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route element={<ProtectedRoute />}>
                  <Route path="/home" element={<Home />} />
                </Route>
              </Routes>
            </Suspense>
          </UnifiedAuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
