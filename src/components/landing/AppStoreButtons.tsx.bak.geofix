
import React from 'react';
import StoreButtons from './StoreButtons';

const AppStoreButtons = () => {
  // Get current date and launch date
  const today = new Date();
  const launchDate = new Date("2025-07-19T00:00:00");
  
  // Check if the current date is past or equal to the launch date
  const isActive = today >= launchDate;

  return (
    <div className={`${!isActive ? 'opacity-80' : ''}`}>
      <StoreButtons />
    </div>
  );
};

export default AppStoreButtons;
