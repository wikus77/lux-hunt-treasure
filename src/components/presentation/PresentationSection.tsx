
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface PresentationSectionProps {
  visible: boolean;
}

const PresentationSection = ({ visible }: PresentationSectionProps) => {
  const [agentCode, setAgentCode] = useState<string>("AG-X480"); // Default code
  const [isLoading, setIsLoading] = useState(true);

  // Fetch the current user's agent code
  useEffect(() => {
    const fetchAgentCode = async () => {
      try {
        // Get the current authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Fetch the user's profile to get their agent code
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('agent_code')
            .eq('id', user.id)
            .single();

          if (error) {
            console.error("Error fetching profile:", error);
          } else if (profile && profile.agent_code) {
            // If the user has an agent code, use it
            setAgentCode(profile.agent_code);
          } else {
            // If the user doesn't have an agent code, generate one and save it
            const newAgentCode = generateAgentCode();
            setAgentCode(newAgentCode);
            
            // Save the new agent code to the user's profile
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ agent_code: newAgentCode })
              .eq('id', user.id);

            if (updateError) {
              console.error("Error updating agent code:", updateError);
            }
          }
        }
      } catch (error) {
        console.error("Error in agent code fetch:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentCode();
  }, []);

  // Generate a unique agent code
  const generateAgentCode = () => {
    // Generate a random alphanumeric code with 5 characters
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding confusing characters like I, O, 0, 1
    let result = 'AG-';
    
    // Add 5 random characters
    for (let i = 0; i < 5; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    
    return result;
  };

  // Ensure component is always visible regardless of props
  return (
    <section className="relative py-20 px-4 bg-black" style={{ opacity: 1, visibility: "visible" }}>
      <div className="max-w-6xl mx-auto">
        <div 
          className="glass-card p-8 md:p-12 text-center relative overflow-hidden"
        >
          <h2 className="text-3xl md:text-4xl font-orbitron mb-8">
            WELCOME TO{" "}
            <span>
              <span className="text-[#00E5FF]">M1</span>
              <span className="text-white">SSION</span>
            </span>
          </h2>
          
          <div className="flex flex-col items-center mb-8">
            <div className="bg-[#00E5FF]/20 px-3 py-1 rounded-md mb-2">
              <span className="text-cyan-400 font-mono text-sm mr-1">DOSSIER:</span>
              <span className="font-mono text-white bg-cyan-900/30 px-2 py-0.5 rounded text-sm">
                {isLoading ? "..." : agentCode}
              </span>
            </div>
          </div>
          
          <p className="text-lg mb-6 max-w-3xl mx-auto text-gray-200">
            In the near future...
            The world becomes a gameboard.
            The clues are encrypted. The stakes are real.
          </p>
          
          <p className="text-lg mb-6 max-w-3xl mx-auto text-gray-200">
            Thousands will try. Only a few will see the pattern.
            You're not just chasing a prize—you're chasing the proof that you can outthink them all.
          </p>

          <p className="text-lg mb-6 max-w-3xl mx-auto text-gray-200">
            This is <span className="text-[#00E5FF]">M1</span><span className="text-white">SSION</span>. The countdown has begun. Are you ready?
          </p>

          {/* Simple static accent line instead of animated one */}
          <div 
            className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"
          />
        </div>
      </div>
    </section>
  );
};

export default PresentationSection;
