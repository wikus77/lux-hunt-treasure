
import React from 'react';
import { Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ClueHeaderProps {
  title: string;
  week: number;
  isFinalWeek?: boolean;
}

const ClueHeader: React.FC<ClueHeaderProps> = ({ title, week, isFinalWeek = false }) => {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">{title}</h2>
      <Badge variant={isFinalWeek ? "destructive" : "secondary"} className="text-sm">
        <Calendar className="w-3 h-3 mr-1" />
        Week {week}
        {isFinalWeek && " (Final)"}
      </Badge>
    </div>
  );
};

export default ClueHeader;
