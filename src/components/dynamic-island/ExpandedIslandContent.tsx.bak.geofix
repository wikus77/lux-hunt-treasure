
import React from "react";
import { Search, User } from "lucide-react";

type ExpandedIslandContentProps = {
  agentId: string;
  secondsLeft: number;
};

const ExpandedIslandContent: React.FC<ExpandedIslandContentProps> = ({ agentId, secondsLeft }) => {
  const formatTime = (totalSeconds: number) => {
    const d = Math.floor(totalSeconds / 86400);
    const h = Math.floor((totalSeconds % 86400) / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    return `${d}g ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const progress = Math.min((secondsLeft / 600) * 100, 100);
  const progressColor = secondsLeft <= 600 ? "bg-red-500" : "bg-green-500";

  return (
    <div className="bg-zinc-900 text-white rounded-2xl shadow-xl p-6">
      <div className="mb-4 flex items-center gap-4">
        <img
          src="/images/avatar-user.png"
          alt="Avatar"
          className="w-10 h-10 rounded-full object-cover border border-white"
        />
        <div>
          <p className="text-sm font-semibold">
            <span className="dynamic-code">M1-AGENT-{agentId}</span>
          </p>
          <p className="text-xs text-gray-400">Hai ricevuto un nuovo indizio!</p>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs font-medium text-gray-300 mb-1">Inizio tra: {formatTime(secondsLeft)}</p>
        <div className="w-full h-1 bg-zinc-700 rounded-full overflow-hidden">
          <div className={`${progressColor} h-full`} style={{ width: `${progress}%` }}></div>
        </div>
      </div>

      <div className="mb-4 text-sm text-zinc-100">
        <p className="font-semibold mb-1">Anteprima indizio:</p>
        <p className="text-xs italic text-zinc-400">"L'oggetto che cerchi è nascosto dove il sole tramonta..."</p>
      </div>

      <div className="grid grid-cols-1 gap-2 text-sm">
        <button className="w-full flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 py-2 px-4 rounded-md transition">
          <Search size={18} className="text-[#00f0ff]" /> Accedi ai tuoi indizi
        </button>
        <button className="w-full flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 py-2 px-4 rounded-md transition">
          <User size={18} className="text-[#ff00e0]" /> Modifica profilo
        </button>
      </div>
    </div>
  );
};

export default ExpandedIslandContent;
