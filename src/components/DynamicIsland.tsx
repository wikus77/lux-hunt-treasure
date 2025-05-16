
import { motion, AnimatePresence } from "framer-motion";
import IslandContent from "./dynamic-island/IslandContent";
import ExpandedIslandContent from "./dynamic-island/ExpandedIslandContent";
import useAgentIdFetcher from "./dynamic-island/useAgentIdFetcher";
import useCountdown from "./dynamic-island/useCountdown";
import useDynamicIsland from "./dynamic-island/useDynamicIsland";

export default function DynamicIsland() {
  const { agentId } = useAgentIdFetcher();
  const { secondsLeft } = useCountdown();
  const { isOpen, isMobile, longPress, handleClick } = useDynamicIsland();

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
          <IslandContent agentId={agentId} />
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
            <ExpandedIslandContent 
              agentId={agentId} 
              secondsLeft={secondsLeft} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
