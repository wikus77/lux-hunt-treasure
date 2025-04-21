
import { Mail } from "lucide-react";

const Notifications = () => {
  return (
    <div className="min-h-screen bg-black text-white pt-0 px-0 w-full">
      {/* Sticky, glassy header */}
      <header className="fixed top-0 left-0 right-0 z-40 w-full px-4 py-6 flex items-center border-b border-projectx-deep-blue backdrop-blur-lg bg-black/70 transition-colors duration-300">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Mail className="w-6 h-6 text-white" />
          Notifiche
        </h2>
      </header>
      {/* Spacer header */}
      <div className="h-[72px] w-full" />
      <div className="rounded-lg bg-projectx-deep-blue bg-opacity-80 p-8 text-center text-white w-full">
        <p>🚧 Nessuna notifica disponibile per ora!</p>
      </div>
    </div>
  );
};

export default Notifications;
