
import React from "react";

interface FuturisticSectionTitleProps {
  children: React.ReactNode;
  className?: string;
}

const FuturisticSectionTitle = ({ children, className }: FuturisticSectionTitleProps) => (
  <h2
    className={`text-2xl sm:text-3xl font-extrabold mb-6
      bg-gradient-to-r from-[#00a3ff] via-[#7E69AB] to-[#d946ef]
      text-transparent bg-clip-text [text-fill-color:transparent] 
      drop-shadow-[0_0_22px_#33c3f0]
      tracking-tight ${className || ""}
    `}
    style={{
      letterSpacing: "0.03em",
      textShadow: "0 0 16px #00a3ff, 0 0 28px #9b87f5"
    }}
  >
    {children}
  </h2>
);

export default FuturisticSectionTitle;
