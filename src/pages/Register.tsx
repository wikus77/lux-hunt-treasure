
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Link, useLocation, useNavigate } from "react-router-dom";
import BackgroundParticles from "@/components/ui/background-particles";
import RegistrationForm from "@/components/auth/registration-form";
import RegisterHeader from "@/components/auth/register-header";
import { Button } from "@/components/ui/button";
import { useQueryParams } from "@/hooks/useQueryParams";

const Register = () => {
  const { preference } = useQueryParams<{ preference?: 'uomo' | 'donna' }>();
  const [missionPreference, setMissionPreference] = useState<'uomo' | 'donna' | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // If preference is passed via query params, use it
    if (preference === 'uomo' || preference === 'donna') {
      setMissionPreference(preference);
    } else {
      // If no preference is set, redirect to mission selection
      navigate("/select-mission");
    }
  }, [preference, navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4 py-12 relative overflow-hidden">
      {/* Background particles */}
      <BackgroundParticles count={15} />

      <motion.div 
        className="w-full max-w-md z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header with logo */}
        <RegisterHeader />
        
        {/* Mission preference indicator */}
        {missionPreference && (
          <motion.div 
            className="mb-6 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <p className="text-sm text-white/70">
              Hai scelto le missioni 
              <span className="font-bold text-[#00D1FF] mx-1">
                {missionPreference === "uomo" ? "UOMO" : "DONNA"}
              </span>
            </p>
            <Button 
              variant="link" 
              className="text-xs text-white/50 hover:text-white/70 p-0 mt-1"
              onClick={() => navigate('/select-mission')}
            >
              Cambia la tua preferenza
            </Button>
          </motion.div>
        )}

        {/* Registration form */}
        <RegistrationForm missionPreference={missionPreference} />

        {/* Terms and conditions & Login link */}
        <div className="mt-6 text-center space-y-4">
          <p className="text-sm text-white/50">
            Registrandoti accetti i nostri Termini e Condizioni e la nostra Informativa sulla Privacy.
          </p>
          
          <p className="text-sm text-white/70">
            Hai già un account?{" "}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors">
              Accedi
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
