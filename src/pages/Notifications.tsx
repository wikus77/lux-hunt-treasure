
import { Mail } from "lucide-react";

const Notifications = () => {
  return (
    <div className="min-h-screen bg-black text-white pt-8 px-4">
      <header className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Mail className="w-6 h-6 text-projectx-neon-blue" />
          Notifiche
        </h2>
      </header>
      <div className="rounded-lg bg-projectx-deep-blue p-8 text-center text-projectx-neon-blue">
        <p>🚧 Nessuna notifica disponibile per ora!</p>
      </div>
    </div>
  );
};

export default Notifications;
