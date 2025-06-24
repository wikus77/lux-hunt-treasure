
export const getMissionDeadline = () => {
  console.log("Getting mission deadline");
  return new Date('2025-08-19T23:59:59');
};

export const getRemainingDays = () => {
  const deadline = getMissionDeadline();
  const now = new Date();
  const diffTime = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};
