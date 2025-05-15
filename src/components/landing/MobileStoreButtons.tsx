
import React from 'react';
import StoreButtons from './StoreButtons';

interface MobileStoreButtonsProps {
  className?: string;
}

const MobileStoreButtons: React.FC<MobileStoreButtonsProps> = ({ className = '' }) => {
  return (
    <div className={`${className}`}>
      <StoreButtons />
    </div>
  );
};

export default MobileStoreButtons;
