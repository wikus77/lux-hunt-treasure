
import React from "react";

const SafeAreaOverlay = () => {
  return (
    <div
      style={{
        height: "env(safe-area-inset-top)",
        backgroundColor: "black",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        pointerEvents: "none",
      }}
    />
  );
};

export default SafeAreaOverlay;
