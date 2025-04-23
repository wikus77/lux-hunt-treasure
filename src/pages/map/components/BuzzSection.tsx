
import React from "react";
import BuzzButton from "@/components/buzz/BuzzButton";

interface BuzzSectionProps {
  onBuzzClick: () => void;
  unlockedClues: number;
}

const BuzzSection = ({ onBuzzClick, unlockedClues }: BuzzSectionProps) => {
  return (
    <div className="w-full flex justify-center py-4 bg-black/50 rounded-xl border border-projectx-deep-blue/40 shadow-xl">
      <BuzzButton
        onBuzzClick={onBuzzClick}
        unlockedClues={unlockedClues}
        isMapBuzz={true}
      />
    </div>
  );
};

export default BuzzSection;
