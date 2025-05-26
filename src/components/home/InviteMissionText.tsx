
import { useState } from "react";
import { motion } from "framer-motion";
import M1ssionText from "@/components/logo/M1ssionText";
import InviteOptionsDialog from "./InviteOptionsDialog";

export default function InviteMissionText() {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <section className="flex flex-col items-center justify-center mt-10 mb-6">
      <motion.div
        className="font-orbitron text-2xl md:text-3xl neon-text-cyan flex items-center gap-1 pb-2 select-none cursor-pointer"
        role="button"
        tabIndex={0}
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ 
          duration: 0.6, 
          delay: 0.1,
          ease: "easeOut" 
        }}
        onClick={() => setDialogOpen(true)}
        onKeyDown={e => { if (e.key === "Enter" || e.key === " ") setDialogOpen(true); }}
        whileHover={{ 
          scale: 1.03,
          transition: { duration: 0.2 }
        }}
        style={{
          textShadow: "0 0 18px #00e5ff, 0 0 28px #00e5ff55, 0 0 24px #fff"
        }}
        aria-label="Invita in M1SSION"
      >
        <span className="text-cyan-400 text-[1.6em] font-bold drop-shadow-lg">M1</span>
        <span className="text-white text-[1.3em] font-bold drop-shadow-lg">SSION<span className="text-xs align-top">™</span></span>
        <span className="ml-4 text-cyan-300 text-base md:text-lg font-orbitron underline decoration-cyan-400 decoration-2 hover:brightness-125 transition-all">
          Invita in M1SSION<span className="text-xs align-top">™</span>
        </span>
      </motion.div>

      <motion.div
        className="text-sm md:text-base text-cyan-100 mt-4 bg-black/40 px-6 py-3 rounded-lg font-inter font-semibold max-w-xl shadow border-cyan-400/30 border"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.6, 
          delay: 0.65,
          ease: "easeOut" 
        }}
        whileHover={{
          boxShadow: "0 0 20px rgba(0, 229, 255, 0.25)",
          transition: { duration: 0.3 }
        }}
      >
        Invita un amico in <span className="font-bold neon-text-cyan">M1SSION<span className="text-xs align-top">™</span></span> e ottieni indizi esclusivi e 5 pressioni gratuite del <span className="font-bold text-yellow-300">tasto Buzz</span>!
      </motion.div>
      <InviteOptionsDialog open={dialogOpen} onOpenChange={setDialogOpen} showIconsOnly />
    </section>
  );
}
