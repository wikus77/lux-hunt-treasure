
import { useEffect, useState } from "react";
import { ThemeProvider } from "../theme-provider";
import { toast } from "sonner";
import { Spinner } from "../ui/spinner";
import { Toaster } from "sonner";
import { Toaster as ShadcnToaster } from "../ui/toaster";
import AppRoutes from "../../routes/AppRoutes";

/**
 * The AppContent component separates the App rendering logic from the provider setup
 */
function AppContent() {
  const [hydrated, setHydrated] = useState(false);

  // Improved hydration handling
  useEffect(() => {
    // Slightly delay setting the hydrated state
    const hydrateTimer = setTimeout(() => {
      setHydrated(true);
      console.log("AppContent hydrated");
    }, 10);
    
    return () => clearTimeout(hydrateTimer);
  }, []);

  useEffect(() => {
    // Check if the user has already been redirected to a specific payment page
    if (!hydrated) return;
    
    try {
      const hasRedirected = localStorage.getItem("paymentRedirected");

      if (hasRedirected) {
        // Remove the item from localStorage
        localStorage.removeItem("paymentRedirected");

        // Show a success toast
        toast.success("Pagamento effettuato con successo!", {
          description: "Grazie per il tuo supporto!",
        });
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error);
    }
  }, [hydrated]);

  useEffect(() => {
    const handleOnline = () => {
      toast.success("Back online!", {
        description: "Connection to the server has been restored.",
      });
    };

    const handleOffline = () => {
      toast.error("No internet connection", {
        description:
          "Some features may be unavailable until the connection is restored.",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Log each render to diagnose potential issues
  console.log("AppContent rendering, hydrated:", hydrated);

  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {hydrated ? (
        <>
          <AppRoutes />
          <Toaster />
          <ShadcnToaster />
        </>
      ) : (
        <div className="flex justify-center items-center min-h-screen bg-black text-white">
          <div className="loading-spinner text-center">
            <div className="w-12 h-12 border-4 border-t-cyan-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <p className="mt-4">Caricamento...</p>
          </div>
        </div>
      )}
    </ThemeProvider>
  );
}

export default AppContent;
