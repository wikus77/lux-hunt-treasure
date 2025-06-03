
import React, { lazy, Suspense, useEffect } from "react";
import { Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/error/ErrorBoundary";
import { Spinner } from "@/components/ui/spinner";
import IOSSafeAreaOverlay from "@/components/debug/IOSSafeAreaOverlay";

// Main app routes with lazy loading - ONLY HOME IS ACCESSIBLE
const AppHome = lazy(() => import("@/pages/AppHome"));

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen bg-black flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Spinner size="lg" className="text-[#00D1FF]" />
      <p className="text-gray-400">Caricamento...</p>
    </div>
  </div>
);

const AppRoutes: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // FORCE REDIRECT TO /home FROM ANY PATH
    if (location.pathname !== "/home") {
      console.log("🔁 Reindirizzamento forzato a /home da:", location.pathname);
      navigate("/home", { replace: true });
    }
  }, [location, navigate]);

  return (
    <ErrorBoundary>
      <IOSSafeAreaOverlay>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            {/* FORCE REDIRECT TO /home FROM ROOT */}
            <Route path="/" element={<Navigate to="/home" replace />} />
            
            {/* FORCE REDIRECT ALL OTHER PATHS TO /home */}
            <Route path="/login" element={<Navigate to="/home" replace />} />
            <Route path="/register" element={<Navigate to="/home" replace />} />
            <Route path="/auth" element={<Navigate to="/home" replace />} />
            <Route path="/auth-debug" element={<Navigate to="/home" replace />} />
            <Route path="/developer" element={<Navigate to="/home" replace />} />
            <Route path="/select-mission" element={<Navigate to="/home" replace />} />
            <Route path="/index" element={<Navigate to="/home" replace />} />
            <Route path="/index.html" element={<Navigate to="/home" replace />} />
            <Route path="/open" element={<Navigate to="/home" replace />} />

            {/* ONLY HOME IS ACCESSIBLE - NO PROTECTION */}
            <Route path="/home" element={<AppHome />} />
            
            {/* CATCH-ALL REDIRECT TO /home */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </Suspense>
      </IOSSafeAreaOverlay>
    </ErrorBoundary>
  );
};

export default AppRoutes;
