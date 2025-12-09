// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
import React, { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { InviteFriendModal } from "@/components/xp/InviteFriendModal";

const InviteFloatingButton: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        aria-label="Invita un Amico"
        data-onboarding="invite"
        onClick={() => setOpen(true)}
        className="fixed z-[70] bottom-40 right-4 md:bottom-44 md:right-8 w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-[hsl(282,90%,45%)]/15 to-[hsl(218,79%,59%)]/15 backdrop-blur-md border border-white/15 shadow-[0_8px_30px_rgba(114,9,183,0.25)] hover:from-[hsl(282,90%,45%)]/25 hover:to-[hsl(218,79%,59%)]/25 transition-all flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.9, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <UserPlus className="w-5 h-5 md:w-6 md:h-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]" />
      </motion.button>

      <InviteFriendModal open={open} onOpenChange={setOpen} />
    </>
  );
};

export default InviteFloatingButton;
