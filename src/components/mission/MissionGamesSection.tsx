
import React from "react";

export default function MissionGamesSection() {
  return (
    <section className="px-4 py-6 bg-[#121212] rounded-2xl shadow-md mt-6">
      <h2 className="text-2xl font-bold text-white mb-2">
        <span className="text-[#00cfff]">M1</span>SSION GAMES
      </h2>
      <p className="text-sm text-gray-400 mb-4">
        Mini giochi quotidiani per veri agenti.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-[#1e1e1e] border border-[#333] rounded-xl p-4 text-white"
          >
            <h3 className="font-semibold">Gioco {i + 1}</h3>
            <p className="text-sm text-gray-400">Descrizione placeholder.</p>
            <button
              disabled
              className="mt-2 bg-gray-600 text-white py-1 px-3 rounded opacity-50 cursor-not-allowed"
            >
              GIOCA
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
