
import React from "react";

type IslandContentProps = {
  agentId: string;
};

const IslandContent: React.FC<IslandContentProps> = ({ agentId }) => {
  // Always display X0197 as the official agent code
  const displayCode = "X0197";
  
  return (
    <span className="text-sm font-medium leading-none tracking-tight">
      <span className="dynamic-code">
        <span className="text-[#00ffff]">M</span>
        <span className="text-white">1-AGENT-{displayCode}</span>
      </span>
    </span>
  );
};

export default IslandContent;
