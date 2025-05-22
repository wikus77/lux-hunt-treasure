
import React from "react";
import M1SSIONMapSafe from "./map/components/M1SSIONMapSafe";

const MapTestSafe = () => {
  return (
    <div className="flex flex-col w-full min-h-screen bg-black/80 text-white p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-projectx-blue mb-2">M1SSION Map Test (Safe Version)</h1>
        <p className="text-gray-300 mb-4">Click anywhere on the map to create a circle.</p>
      </div>
      
      <div className="flex-1 w-full">
        <M1SSIONMapSafe />
      </div>
      
      <div className="mt-4 p-4 bg-black/50 rounded-lg border border-projectx-deep-blue/40">
        <h2 className="text-lg font-medium mb-2">Instructions:</h2>
        <ul className="list-disc pl-5 space-y-1 text-gray-300">
          <li>Each click creates a persistent circle</li>
          <li>Circles are stored in a global array outside React</li>
          <li>Click on any circle to see its details</li>
        </ul>
      </div>
    </div>
  );
};

export default MapTestSafe;
