
import React from "react";

type IslandContentProps = {
  agentId: string;
};

const IslandContent: React.FC<IslandContentProps> = ({ agentId }) => {
  return (
    <span className="text-sm font-medium leading-none tracking-tight">
      <span className="dynamic-code">M1-AGENT-{agentId}</span>
    </span>
  );
};

export default IslandContent;
