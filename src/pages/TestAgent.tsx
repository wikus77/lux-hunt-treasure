
import React from "react";
import AgentBadge from "@/components/AgentBadge";

export default function TestAgent() {
  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center text-white">
      <h1 className="text-2xl mb-6">Preview: M1-AGENT Badge</h1>
      <AgentBadge />
      
      <div className="mt-10">
        <h2 className="text-xl mb-4">Expected Behavior:</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Shows <code>M1-AGENT-X0197</code> for email wikus77@hotmail.it</li>
          <li>Shows agent code from profile for other logged-in users</li>
          <li>Shows <code>M1-AGENT-?????</code> for non-logged users</li>
          <li>Fade-in + glow animation after 2 seconds</li>
          <li>Pulsing dot indicator present</li>
          <li>Rounded borders on badge</li>
        </ul>
      </div>
    </main>
  );
}
