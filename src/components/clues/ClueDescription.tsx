
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface ClueDescriptionProps {
  description: string;
}

const ClueDescription: React.FC<ClueDescriptionProps> = ({ description }) => {
  return (
    <Card>
      <CardContent className="p-4 text-md">
        <p>{description}</p>
      </CardContent>
    </Card>
  );
};

export default ClueDescription;
