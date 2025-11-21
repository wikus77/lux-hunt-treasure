
import CountdownTimer from "@/components/ui/countdown-timer";
import { getMissionDeadline } from "@/utils/countdownDate";

interface HeaderCountdownProps {
  isMobile?: boolean;
}

const HeaderCountdown = ({ isMobile = false }: HeaderCountdownProps) => {
  // Target date from utility
  const targetDate = getMissionDeadline();
  
  if (isMobile) {
    return (
      <div className="md:hidden flex justify-center py-1.5">
        <CountdownTimer targetDate={targetDate} />
      </div>
    );
  }

  return (
    <div className="hidden md:flex justify-center py-1.5">
      <CountdownTimer targetDate={targetDate} />
    </div>
  );
};

export default HeaderCountdown;
