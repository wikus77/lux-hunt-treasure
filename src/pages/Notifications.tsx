
import { Mail } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";

const Notifications = () => {
  const { notifications, reloadNotifications } = useNotifications();

  // Visualizzazione già ordinata dal più recente
  return (
    <div className="min-h-screen bg-black text-white pt-0 px-0 w-full">
      <div className="rounded-lg bg-projectx-deep-blue bg-opacity-80 p-8 text-center text-white w-full mt-4">
        <p className="mb-4 font-bold text-lg flex items-center justify-center gap-2">
          <Mail className="inline-block w-5 h-5 mr-2" />
          Le tue notifiche
        </p>
        {notifications.length === 0 ? (
          <p>🚧 Nessuna notifica disponibile per ora!</p>
        ) : (
          <ul className="space-y-4">
            {notifications
              .sort((a, b) => (b.date > a.date ? 1 : -1))
              .map((n) => (
                <li key={n.id}>
                  <div className={`p-3 rounded-md transition-colors ${
                    n.read ? "bg-projectx-deep-blue bg-opacity-30" : "bg-projectx-deep-blue"
                  }`}>
                    <div className="flex items-start">
                      <div className={`p-2 rounded-full mr-3 ${
                        n.read ? 'bg-gray-700' : 'bg-projectx-pink'
                      }`}>
                        <Mail className="h-4 w-4" />
                      </div>
                      <div className="flex-1 text-left">
                        <h4 className="text-sm font-medium">{n.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{n.description}</p>
                        <span className="text-xs text-muted-foreground mt-2 block">{new Date(n.date).toLocaleString()}</span>
                      </div>
                      {!n.read && (
                        <div className="w-2 h-2 rounded-full bg-projectx-pink mt-2"></div>
                      )}
                    </div>
                  </div>
                </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Notifications;
