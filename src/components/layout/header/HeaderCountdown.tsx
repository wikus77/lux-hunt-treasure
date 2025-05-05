
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
      <div className="md:hidden flex justify-center pb-2">
        <CountdownTimer targetDate={targetDate} />
      </div>
    );
  }

  return (
    <div className="hidden md:flex items-center">
      <CountdownTimer targetDate={targetDate} />
    </div>
  );
};

export default HeaderCountdown;
