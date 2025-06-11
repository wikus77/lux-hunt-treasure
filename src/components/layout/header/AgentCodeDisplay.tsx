
import React, { useEffect, useState } from 'react';
import { useAuthContext } from '@/contexts/auth';
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import AgentBadge from '@/components/AgentBadge';

interface AgentCodeDisplayProps {
  agentCode?: string;
}

// This component is now just a wrapper for AgentBadge
// We keep it for backward compatibility
const AgentCodeDisplay: React.FC<AgentCodeDisplayProps> = () => {
  return <AgentBadge />;
};

export default AgentCodeDisplay;
