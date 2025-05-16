
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Search } from "lucide-react";

export default function DynamicIsland() {
  const [isOpen, setIsOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [agentId, setAgentId] = useState("");

  useEffect(() => {
    const storedId = localStorage.getItem("m1-agent-id");
    if (storedId) {
      setAgentId(storedId);
    } else {
      const randomId = `XX${Math.floor(100 + Math.random() * 900)}`;
      localStorage.setItem("m1-agent-id", randomId);
      setAgentId(randomId);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const timeout = setTimeout(() => setIsOpen(false), 7000);
    return () => clearTimeout(timeout);
  }, [isOpen]);

  useEffect(() => {
    const launchDate = new Date("2025-07-19T00:00:00Z").getTime();
    const updateCountdown = () => {
      const now = new Date().getTime();
      const remaining = Math.max(0, Math.floor((launchDate - now) / 1000));
      setSecondsLeft(remaining);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds) => {
    const d = Math.floor(totalSeconds / 86400);
    const h = Math.floor((totalSeconds % 86400) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${d}g ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const progress = Math.min((secondsLeft / 600) * 100, 100);
  const progressColor = secondsLeft <= 600 ? "bg-red-500" : "bg-green-500";

  let glow = "";
  if (secondsLeft <= 3600) {
    glow = "animate-pulse ring-4 ring-[#ff00e0] ring-offset-2 ring-offset-zinc-900";
  } else if (secondsLeft <= 86400) {
    glow = "animate-pulse ring-2 ring-[#00f0ff] ring-offset-2 ring-offset-zinc-900";
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 flex flex-col items-center w-full">
      <div className="relative">
        <motion.div
          layoutId="dynamic-island"
          className={`dynamic-island z-50 flex items-center justify-center cursor-pointer text-sm font-medium shadow-md bg-gradient-to-b from-[#1a1a1a] to-[#0d0d0d] text-white px-6`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setIsOpen((prev) => !prev)}
          initial={false}
          animate={{
            borderRadius: "999px",
            scaleX: isOpen ? 1.1 : 1,
          }}
          transition={{ type: "spring", stiffness: 240, damping: 22 }}
          style={{ height: 44, minWidth: 120 }}
        >
          <span className="text-sm font-medium leading-none tracking-tight">
            <span className="text-[#00f0ff]">M</span>
            <span className="text-white">1-{agentId}</span>
          </span>
        </motion.div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="dynamic-content"
            className="z-40 mt-2 w-[90vw] max-w-[500px] origin-top"
            initial={{ opacity: 0, scaleY: 0.6 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0.6 }}
            transition={{ duration: 0.5, ease: [0.42, 0, 0.58, 1] }}
            style={{ transformOrigin: "top center" }}
          >
            <div className="bg-zinc-900 text-white rounded-2xl shadow-xl p-6">
              <div className="mb-4 flex items-center gap-4">
                <img
                  src="/images/avatar-user.png"
                  alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover border border-white"
                />
                <div>
                  <p className="text-sm font-semibold">
                    <span className="text-[#00f0ff]">M</span>
                    <span className="text-white">1-{agentId}</span>
                  </p>
                  <p className="text-xs text-gray-400">Hai ricevuto un nuovo indizio!</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs font-medium text-gray-300 mb-1">Inizio tra: {formatTime(secondsLeft)}</p>
                <div className="w-full h-1 bg-zinc-700 rounded-full overflow-hidden">
                  <div className={`${progressColor} h-full`} style={{ width: `${progress}%` }}></div>
                </div>
              </div>

              <div className="mb-4 text-sm text-zinc-100">
                <p className="font-semibold mb-1">Anteprima indizio:</p>
                <p className="text-xs italic text-zinc-400">"L'oggetto che cerchi è nascosto dove il sole tramonta..."</p>
              </div>

              <div className="grid grid-cols-1 gap-2 text-sm">
                <button className="w-full flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 py-2 px-4 rounded-md transition">
                  <Search size={18} className="text-[#00f0ff]" /> Accedi ai tuoi indizi
                </button>
                <button className="w-full flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 py-2 px-4 rounded-md transition">
                  <User size={18} className="text-[#ff00e0]" /> Modifica profilo
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
