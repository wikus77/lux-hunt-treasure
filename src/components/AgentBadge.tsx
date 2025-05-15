
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const AgentBadge = () => {
  const [agentCode, setAgentCode] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // First check for special admin case
      if (user?.email === "wikus77@hotmail.it") {
        setAgentCode("X0197");
        return;
      }
      
      // Only fetch from database if we have a user and they're not the special admin
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("agent_code")
          .eq("id", user.id)
          .single();

        if (data?.agent_code) {
          setAgentCode(data.agent_code.replace("AG-", ""));
        }
      }
    };

    fetch();
    
    // Set the delay for the glow animation
    const timer = setTimeout(() => setShow(true), 2000);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-1
        text-sm font-mono text-white
        border border-white/20 shadow-md
        bg-[#0e0e0e]/80 rounded-full transition-opacity duration-500
        ${show ? "opacity-100 glow" : "opacity-0"}
      `}
    >
      <span className="text-cyan-400">M1-AGENT-{agentCode ?? "?????"}</span>
      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
    </div>
  );
};

export default AgentBadge;
