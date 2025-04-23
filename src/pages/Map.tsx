
const processCluesAndAddSearchArea = () => {
  const newClickCount = buzzClickCount + 1;
  setBuzzClickCount(newClickCount);

  const baseRadius = 100000;
  const reduction = Math.min(newClickCount - 1, 10) * 5000;
  const radius = Math.max(baseRadius - reduction, 50000);

  const unlockedClues = clues.filter(clue => !clue.isLocked);

  const lat = currentLocation ? currentLocation[0] : DEFAULT_CENTER.lat;
  const lng = currentLocation ? currentLocation[1] : DEFAULT_CENTER.lng;

  const randomOffset = (Math.random() - 0.5) * 0.05;
  const newSearchArea = {
    id: crypto.randomUUID(),
    lat: lat + randomOffset,
    lng: lng + randomOffset,
    radius: radius,
    label: `Area di ricerca AI (Tentativo ${newClickCount})`,
    editing: false,
    isAI: true,
  };

  setSearchAreas([newSearchArea]);
  setActiveSearchArea(newSearchArea.id);

  // Removed the toast notification about radius
  toast.success(`Area di ricerca aggiunta!`);
};
