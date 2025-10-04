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
        onClick={() => setOpen(true)}
        className="fixed z-[70] top-24 right-4 md:top-28 md:right-8 w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-[#7209b7]/20 to-[#4361ee]/20 backdrop-blur-md border border-white/10 shadow-[0_8px_30px_rgba(67,97,238,0.35)] hover:from-[#7209b7]/30 hover:to-[#4361ee]/30 transition-all flex items-center justify-center"
        initial={{ opacity: 0, scale: 0.9, y: -10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <UserPlus className="w-5 h-5 md:w-6 md:h-6 text-white" />
      </motion.button>

      <InviteFriendModal open={open} onOpenChange={setOpen} />
    </>
  );
};

export default InviteFloatingButton;
