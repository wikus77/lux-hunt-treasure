
import React from 'react';
import { AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface LocationHintsProps {
  regionHint?: string;
  cityHint?: string;
}

const LocationHints: React.FC<LocationHintsProps> = ({ regionHint, cityHint }) => {
  if (!regionHint && !cityHint) return null;
  
  return (
    <Card className="bg-black/50">
      <CardHeader className="py-2 px-4">
        <CardTitle className="text-lg flex items-center">
          <AlertCircle className="w-4 h-4 mr-2 text-amber-400" />
          Location Hints
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2 px-4 space-y-2">
        {regionHint && (
          <div>
            <span className="font-medium text-amber-400">Region:</span> {regionHint}
          </div>
        )}
        {cityHint && (
          <div>
            <span className="font-medium text-amber-400">City:</span> {cityHint}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LocationHints;
