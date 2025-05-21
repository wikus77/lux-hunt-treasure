
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-black bg-gradient-to-b from-[#131524]/70 to-black">
      <div className="glass-card px-6 py-8 text-center">
        <h1 className="text-4xl font-bold mb-4 gradient-text-cyan">404</h1>
        <p className="text-xl text-white/80 mb-6">Oops! Pagina non trovata</p>
        <Button asChild>
          <Link to="/">Torna alla Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
