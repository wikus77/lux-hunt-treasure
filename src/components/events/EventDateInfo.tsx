
import { CalendarDays } from "lucide-react";

interface EventDateInfoProps {
  date: string;
}

const EventDateInfo = ({ date }: EventDateInfoProps) => {
  return (
    <div className="space-y-2 mb-4">
      <div className="flex items-center text-sm">
        <CalendarDays className="h-4 w-4 mr-2 text-muted-foreground" />
        <span>{date}</span>
      </div>
    </div>
  );
};

export default EventDateInfo;
