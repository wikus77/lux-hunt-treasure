
import React, { useState } from "react";
import M1SSIONMapSafe from "./map/components/M1SSIONMapSafe";
import { Button } from "@/components/ui/button";

const MapTestSafe = () => {
  const [radius, setRadius] = useState<number>(500);

  return (
    <div className="flex flex-col w-full min-h-screen bg-black/90 text-white p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-projectx-blue mb-2">M1SSION Map Test (Persistent Mode)</h1>
        <p className="text-gray-300">Click anywhere on the map to create a circle. Circles persist between renders.</p>
      </div>
      
      <div className="mb-4 flex flex-wrap gap-2">
        <Button 
          variant="outline"
          className="bg-projectx-deep-blue/20 border-projectx-blue/40 hover:bg-projectx-blue/30"
          onClick={() => setRadius(200)}
        >
          Small (200m)
        </Button>
        <Button 
          variant="outline"
          className="bg-projectx-deep-blue/20 border-projectx-blue/40 hover:bg-projectx-blue/30"
          onClick={() => setRadius(500)}
        >
          Medium (500m)
        </Button>
        <Button 
          variant="outline"
          className="bg-projectx-deep-blue/20 border-projectx-blue/40 hover:bg-projectx-blue/30"
          onClick={() => setRadius(1000)}
        >
          Large (1km)
        </Button>
        <div className="ml-4 flex items-center space-x-2">
          <span className="text-gray-400">Current radius:</span> 
          <span className="text-projectx-blue font-bold">{radius}m</span>
        </div>
      </div>
      
      <div className="flex-1 w-full mb-4 h-[500px]">
        <M1SSIONMapSafe selectedRadius={radius} />
      </div>
      
      <div className="p-4 bg-black/70 rounded-lg border border-projectx-deep-blue/40">
        <h2 className="text-lg font-medium mb-2">How It Works:</h2>
        <ul className="list-disc pl-5 space-y-2 text-gray-300">
          <li>Each circle is <span className="text-projectx-blue font-medium">stored globally</span> outside React's state</li>
          <li>Circles <span className="text-projectx-blue font-medium">persist between renders</span> and component remounts</li>
          <li>Click on any circle to see its details in a popup</li>
          <li>Try navigating away and back - circles will remain!</li>
        </ul>
      </div>
    </div>
  );
};

export default MapTestSafe;
