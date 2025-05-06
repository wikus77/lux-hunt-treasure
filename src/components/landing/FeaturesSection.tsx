
import React from "react";

interface FeaturesSectionProps {
  countdownCompleted?: boolean;
}

// This component is no longer used as requested
const FeaturesSection = ({ countdownCompleted = false }: FeaturesSectionProps) => {
  return null; // Return null to not render anything
};

export default FeaturesSection;
