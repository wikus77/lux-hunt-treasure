
import React from "react";

export default function MissionGamesSection() {
  return (
    <section className="px-4 py-6 mt-6 rounded-2xl shadow-lg bg-[#1b1b1b] border border-[#2d2d2d]">
      <h2 className="text-2xl font-bold mb-1 text-white">
        <span className="text-[#00cfff]">M1</span>SSION GAMES
      </h2>
      <p className="text-sm text-gray-400 mb-4">Mini giochi quotidiani per veri agenti.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-[#242424] border border-[#3d3d3d] rounded-xl p-4 text-white hover:shadow-xl transition-shadow"
          >
            <h3 className="font-semibold mb-1">Gioco {i + 1}</h3>
            <p className="text-sm text-gray-400">Descrizione placeholder.</p>
            <button
              disabled
              className="mt-3 bg-gray-700 text-white py-1 px-4 rounded opacity-60 cursor-not-allowed"
            >
              GIOCA
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
