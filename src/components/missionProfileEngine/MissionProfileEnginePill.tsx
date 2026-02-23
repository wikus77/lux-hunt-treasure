/**
 * MISSION PROFILE ENGINE™ — Pill below BUZZ card (centered).
 * Title: M1 (cyan) + SSION PROFILE ENGINE (white), pulse, WKWebView-safe.
 * © 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import './mpe-pill-title.css';

interface MissionProfileEnginePillProps {
  onPress: () => void;
}

export const MissionProfileEnginePill: React.FC<MissionProfileEnginePillProps> = ({ onPress }) => {
  const { t } = useTranslation();

  return (
    <motion.button
      type="button"
      onClick={onPress}
      className="flex w-[85%] max-w-sm items-center gap-3 rounded-2xl border border-white/15 bg-white/5 px-4 py-3 text-left backdrop-blur-sm transition active:scale-[0.98]"
      whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
      whileTap={{ scale: 0.98 }}
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400">
        <BarChart3 className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <span className="mpe-pill-title mpe-pill-title-wrap block">
          <span className="mpe-pill-title-m1">M1</span>
          <span className="mpe-pill-title-rest">SSION PROFILE ENGINE</span>
        </span>
        <div className="text-xs text-white/60 truncate">
          {t('mission_profile_engine_subtitle')}
        </div>
      </div>
      <span className="shrink-0 rounded-full bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">
        {t('mission_profile_engine_badge_free')}
      </span>
    </motion.button>
  );
};
