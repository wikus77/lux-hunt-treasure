
import { motion } from "framer-motion";
import { CommandCenter } from "@/components/command-center/CommandCenter";

interface CommandCenterWrapperProps {
  allModulesUnlocked: boolean;
}

const CommandCenterWrapper = ({ allModulesUnlocked }: CommandCenterWrapperProps) => {
  if (!allModulesUnlocked) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1, duration: 1 }}
      className="mt-8"
    >
      <CommandCenter />
    </motion.div>
  );
};

export default CommandCenterWrapper;
