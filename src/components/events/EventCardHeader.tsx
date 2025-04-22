
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface EventCardHeaderProps {
  title: string;
  carBrand: string;
  carModel: string;
  isCurrent: boolean;
}

const EventCardHeader = ({ title, carBrand, carModel, isCurrent }: EventCardHeaderProps) => {
  return (
    <CardHeader className="pb-2">
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className={`text-lg ${isCurrent ? "neon-text" : ""}`}>{title}</CardTitle>
          <CardDescription>{carBrand} {carModel}</CardDescription>
        </div>
        {isCurrent && (
          <span className="px-2 py-1 text-xs rounded-full bg-m1ssion-pink text-white">
            In corso
          </span>
        )}
      </div>
    </CardHeader>
  );
};

export default EventCardHeader;
