
import React from 'react';
import { motion } from "framer-motion";
import ClueHeader from './ClueHeader';
import ClueDescription from './ClueDescription';
import LocationHints from './LocationHints';
import ClueMap from './ClueMap';

interface ClueLocation {
  lat: number;
  lng: number;
  label: string;
}

interface ClueDetailViewProps {
  title: string;
  description: string;
  regionHint?: string;
  cityHint?: string;
  location: ClueLocation;
  week: number;
  isFinalWeek?: boolean;
}

const ClueDetailView: React.FC<ClueDetailViewProps> = ({
  title,
  description,
  regionHint,
  cityHint,
  location,
  week,
  isFinalWeek = false
}) => {
  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        {/* Clue Header with Week Information */}
        <ClueHeader 
          title={title}
          week={week}
          isFinalWeek={isFinalWeek}
        />
        
        {/* Clue Description */}
        <ClueDescription description={description} />
        
        {/* Location Hints */}
        <LocationHints 
          regionHint={regionHint}
          cityHint={cityHint}
        />
        
        {/* Map Component and Location Label */}
        <ClueMap location={location} />
      </motion.div>
    </div>
  );
};

export default ClueDetailView;
