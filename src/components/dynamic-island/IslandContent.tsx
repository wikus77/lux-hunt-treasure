
import React from "react";

type IslandContentProps = {
  agentId: string;
};

const IslandContent: React.FC<IslandContentProps> = ({ agentId }) => {
  return (
    <span className="text-sm font-medium leading-none tracking-tight">
      <span className="dynamic-code">
        <span className="text-[#00ffff]">M</span>
        <span className="text-white">1-AGENT-{agentId}</span>
      </span>
    </span>
  );
};

export default IslandContent;
