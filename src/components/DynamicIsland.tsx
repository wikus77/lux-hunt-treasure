
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLongPress } from "@/hooks/useLongPress";
import { useIsMobile } from "@/hooks/use-mobile";

export default function DynamicIsland() {
  const [isOpen, setIsOpen] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [agentId, setAgentId] = useState("");
  const isMobile = useIsMobile();

  // Handle haptic feedback
  const triggerHapticFeedback = () => {
    if (navigator.vibrate && isMobile) {
      navigator.vibrate(30); // 30ms vibration for subtle feedback
    }
  };

  // Long press handler for mobile
  const handleLongPress = () => {
    triggerHapticFeedback();
    setIsOpen(true);
  };

  // Configure long press
  const longPress = useLongPress(handleLongPress, {
    threshold: 400 // 400ms threshold for long press
  });

  // Handle click for desktop
  const handleClick = () => {
    if (!isMobile) {
      setIsOpen(!isOpen);
    }
  };

  useEffect(() => {
    const fetchAgentCode = async () => {
      // Try to get the agent code from Supabase if the user is logged in
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Special admin case
          if (user.email === "wikus77@hotmail.it") {
            setAgentId("X0197");
            localStorage.setItem("m1-agent-id", "X0197");
            return;
          }
          
          // Get agent code from database
          const { data, error } = await supabase
            .rpc('get_my_agent_code')
            .single();

          if (!error && data?.agent_code) {
            const code = data.agent_code.replace("AG-", "");
            setAgentId(code);
            localStorage.setItem("m1-agent-id", code);
          } else {
            // Fallback to stored code
            const storedId = localStorage.getItem("m1-agent-id");
            if (storedId) {
              setAgentId(storedId);
            } else {
              // Generate a new code only if nothing is available
              const randomId = `XX${Math.floor(100 + Math.random() * 900)}`;
              localStorage.setItem("m1-agent-id", randomId);
              setAgentId(randomId);
            }
          }
        } else {
          // Not logged in, use stored or generate code
          const storedId = localStorage.getItem("m1-agent-id");
          if (storedId) {
            setAgentId(storedId);
          } else {
            const randomId = `XX${Math.floor(100 + Math.random() * 900)}`;
            localStorage.setItem("m1-agent-id", randomId);
            setAgentId(randomId);
          }
        }
      } catch (error) {
        // Fallback in case of any error
        console.error("Error fetching agent code:", error);
        const storedId = localStorage.getItem("m1-agent-id");
        if (storedId) {
          setAgentId(storedId);
        } else {
          const randomId = `XX${Math.floor(100 + Math.random() * 900)}`;
          localStorage.setItem("m1-agent-id", randomId);
          setAgentId(randomId);
        }
      }
    };

    fetchAgentCode();
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

  // Add backdrop blur when popup is open (mobile only)
  useEffect(() => {
    const mainContent = document.querySelector('main');
    if (mainContent && isMobile) {
      if (isOpen) {
        mainContent.style.filter = 'blur(3px)';
        mainContent.style.opacity = '0.6';
        mainContent.style.transition = 'filter 0.3s, opacity 0.3s';
      } else {
        mainContent.style.filter = '';
        mainContent.style.opacity = '';
      }
    }
    
    return () => {
      if (mainContent) {
        mainContent.style.filter = '';
        mainContent.style.opacity = '';
      }
    };
  }, [isOpen, isMobile]);

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
          className={`dynamic-island z-50 flex items-center justify-center cursor-pointer text-sm font-medium shadow-md px-6`}
          whileHover={{ scale: isMobile ? 1 : 1.1 }} // Only apply hover animation on desktop
          whileTap={{ scale: 0.97 }}
          onClick={handleClick}
          {...longPress}
          initial={false}
          animate={{
            borderRadius: "999px",
            scaleX: isOpen ? 1.1 : 1,
          }}
          transition={{ type: "spring", stiffness: 240, damping: 22 }}
          style={{ 
            height: 44, // 7% reduction from original 48px height
            minWidth: 132, // 10% larger than original 120px
            transform: "scale(1.1)" // Ensure 10% size increase
          }}
        >
          <span className="text-sm font-medium leading-none tracking-tight">
            <span className="dynamic-code">M1-AGENT-{agentId}</span>
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
                    <span className="dynamic-code">M1-AGENT-{agentId}</span>
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
