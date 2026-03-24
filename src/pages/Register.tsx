// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// 🎬 VISUAL ALIGNMENT: Matches LoginPage premium dialog modal style

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { createPortal } from "react-dom";
import { motion } from "framer-motion";
import { Link } from "wouter";
import { Shield, UserPlus } from "lucide-react";
import { useWouterNavigation } from "@/hooks/useWouterNavigation";
import RegistrationForm from "@/components/auth/registration-form";
import { Button } from "@/components/ui/button";
import { useQueryParams } from "@/hooks/useQueryParams";


const Register = () => {
  const { t } = useTranslation();
  const { preference } = useQueryParams<{ preference?: 'uomo' | 'donna' }>();
  const [missionPreference, setMissionPreference] = useState<'uomo' | 'donna' | null>(null);
  const { navigate } = useWouterNavigation();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);
  
  useEffect(() => {
    // If preference is passed via query params, use it
    if (preference === 'uomo' || preference === 'donna') {
      setMissionPreference(preference);
    }
    // Allow registration without mission preference
  }, [preference]);

  if (!mounted) return null;

  // 🎬 Dialog Modal Style - Matches LoginPage exactly
  return createPortal(
    <div 
      className="fixed inset-0 z-[100]"
      style={{
        paddingTop: 'max(env(safe-area-inset-top, 16px), 16px)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 16px), 16px)',
        paddingLeft: '16px',
        paddingRight: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflowY: 'auto',
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,209,255,0.08),transparent_60%)] pointer-events-none" />
      
      {/* Modal Card with entrance animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="relative z-10 w-full max-w-md my-auto"
      >
        {/* Neon glass container - matches LoginPage */}
        <div className="relative rounded-2xl p-[1.5px] bg-gradient-to-r from-[#00D1FF] via-[#7C3AED] to-[#00D1FF] shadow-[0_0_30px_rgba(124,58,237,0.35)]">
          <div className="rounded-2xl bg-black/95 backdrop-blur-xl p-6">
            
            {/* Logo/Title - matches LoginPage */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#00D1FF]/20 to-[#7C3AED]/20 border border-[#00D1FF]/30 mb-4">
                <UserPlus className="w-8 h-8 text-[#00D1FF]" />
              </div>
              <h1 className="text-2xl font-orbitron font-bold bg-gradient-to-r from-[#00D1FF] to-[#7C3AED] bg-clip-text text-transparent mb-1">
                M1SSION™
              </h1>
              <p className="text-white/60 text-sm">
                {t('register_subtitle')}
              </p>
            </div>
            
            {/* Mission preference indicator */}
            {missionPreference && (
              <motion.div 
                className="mb-4 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <p className="text-sm text-white/70">
                  {t('register_mission_selected')}{' '}
                  <span className="font-bold text-[#00D1FF] mx-1">
                    {missionPreference === "uomo" ? t('register_mission_man') : t('register_mission_woman')}
                  </span>
                </p>
                <Button 
                  variant="link" 
                  className="text-xs text-white/40 hover:text-[#00D1FF] p-0 mt-1"
                  onClick={() => navigate('/select-mission')}
                >
                  {t('register_change_preference')}
                </Button>
              </motion.div>
            )}

            {/* Registration form */}
            <RegistrationForm missionPreference={missionPreference} />

            {/* Toggle to login - matches LoginPage style */}
            <div className="text-center pt-4">
              <Link to="/login">
                <Button
                  type="button"
                  variant="link"
                  className="text-white/50 hover:text-[#00D1FF]"
                >
                  {t('register_already_have_account')}
                </Button>
              </Link>
            </div>

            {/* Footer - matches LoginPage */}
            <div className="text-center mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-white/40">
                {t('register_terms_intro')}{' '}
                <button type="button" className="text-[#00D1FF]/70 hover:text-[#00D1FF]" onClick={() => window.open('/terms', '_blank')}>
                  {t('register_terms_link')}
                </button>
                {' '}{t('register_terms_and')}{' '}
                <button type="button" className="text-[#00D1FF]/70 hover:text-[#00D1FF]" onClick={() => window.open('/privacy-policy', '_blank')}>
                  {t('register_privacy_link')}
                </button>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};

export default Register;
