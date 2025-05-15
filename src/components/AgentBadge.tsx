
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const AgentBadge = () => {
  const [agentCode, setAgentCode] = useState<string | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const fetchCode = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;

        if (user.email === "wikus77@hotmail.it") {
          setAgentCode("X0197");
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("agent_code")
          .eq("id", user.id)
          .single();

        if (data?.agent_code) {
          setAgentCode(data.agent_code.replace("AG-", ""));
        }
      } catch (err) {
        console.error("Error fetching agent code:", err);
      }
    };

    fetchCode();

    const timeout = setTimeout(() => {
      setShow(true);
    }, 2000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div
      className={`
        flex items-center gap-2 px-3 py-1
        text-sm font-mono text-white
        bg-[#0e0e0e]/80 border border-white/20
        rounded-full shadow
        ${show ? "animate-glow" : "opacity-0"}
      `}
    >
      <span className="text-cyan-400">M1-AGENT-{agentCode || "?????"}</span>
      <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
    </div>
  );
};

export default AgentBadge;
