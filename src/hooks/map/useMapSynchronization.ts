
import { useEffect } from 'react';

export const useMapSynchronization = (
  isAddingPoint: boolean,
  isAddingMapPoint: boolean,
  setIsAddingMapPoint: (value: boolean) => void,
  setIsAddingPoint: (value: boolean) => void
) => {
  // Synchronize isAddingMapPoint state between hook and mapLogic to ensure consistency
  useEffect(() => {
    console.log("🔄 Synchronizing isAddingMapPoint states:", 
      {hookState: isAddingMapPoint, mapLogicState: isAddingPoint});
    
    if (isAddingPoint !== isAddingMapPoint) {
      console.log("🔄 Setting hook isAddingMapPoint to:", isAddingPoint);
      setIsAddingMapPoint(isAddingPoint);
    }
  }, [isAddingPoint, isAddingMapPoint, setIsAddingMapPoint]);

  // Also propagate state from hook to parent if needed
  useEffect(() => {
    if (isAddingMapPoint !== isAddingPoint) {
      console.log("🔄 Setting mapLogic isAddingMapPoint to:", isAddingMapPoint);
      setIsAddingPoint(isAddingMapPoint);
    }
  }, [isAddingMapPoint, isAddingPoint, setIsAddingPoint]);
  
  // Debug logging for isAddingMapPoint state
  useEffect(() => {
    console.log("🔍 MapLogicProvider - Current isAddingMapPoint:", 
      {hookState: isAddingMapPoint, mapLogicState: isAddingPoint});
  }, [isAddingMapPoint, isAddingPoint]);
};
