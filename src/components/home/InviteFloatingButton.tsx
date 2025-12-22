// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// 🔧 FIX: Stile pill come PulseBreakerPill
import React, { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { InviteFriendModal } from "@/components/xp/InviteFriendModal";
import '@/features/pulse/styles/pulse-pill.css';

const InviteFloatingButton: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        aria-label="Invita un Amico"
        data-onboarding="invite"
        onClick={() => setOpen(true)}
        className="pe-pill-orb fixed z-[70] bottom-40 right-4 md:bottom-44 md:right-8"
        initial={{ opacity: 0, scale: 0.9, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        {/* Icon */}
        <UserPlus className="w-5 h-5 z-10 relative text-fuchsia-400" style={{ filter: 'drop-shadow(0 0 4px #d946ef)' }} />
        
        {/* Orbiting dot */}
        <span className="pe-dot" style={{ background: 'linear-gradient(135deg, #d946ef, #8b5cf6)' }} />
        
        {/* Decorative arc overlay */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="rgba(217, 70, 239, 0.15)"
            strokeWidth="2"
          />
          <circle
            cx="50%"
            cy="50%"
            r="45%"
            fill="none"
            stroke="url(#inviteGradient)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="200 283"
          />
          <defs>
            <linearGradient id="inviteGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#d946ef" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>
        </svg>
      </motion.button>

      <InviteFriendModal open={open} onOpenChange={setOpen} />
    </>
  );
};

export default InviteFloatingButton;
