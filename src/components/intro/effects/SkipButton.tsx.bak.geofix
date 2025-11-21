
import React from "react";
import { motion } from "framer-motion";

interface SkipButtonProps {
  onClick: () => void;
}

const SkipButton: React.FC<SkipButtonProps> = ({ onClick }) => {
  return (
    <motion.button
      className="skip-button"
      onClick={onClick}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.7 }}
      whileHover={{ opacity: 1 }}
      transition={{ delay: 2 }}
    >
      SKIP
    </motion.button>
  );
};

export default SkipButton;
