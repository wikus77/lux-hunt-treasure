
import React, { useEffect } from "react";

export default function MissionGamesSection() {
  useEffect(() => {
    console.log("✅ MissionGamesSection RENDERED");
  }, []);

  return (
    <div
      style={{
        backgroundColor: "lime",
        color: "black",
        padding: "100px",
        textAlign: "center",
        fontSize: "24px",
        zIndex: 9999,
        border: "10px solid red",
      }}
    >
      🚨 MISSION GAMES SECTION VISIBILE 🚨
    </div>
  );
}
