
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";
import type { Notification } from "@/hooks/useNotifications";

interface NotificationDialogProps {
  notification: Notification | null;
  open: boolean;
  onClose: () => void;
}

const NotificationDialog = ({ notification, open, onClose }: NotificationDialogProps) => {
  if (!notification) return null;

  const formattedDate = formatDistanceToNow(new Date(notification.date), {
    addSuffix: true,
    locale: it,
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-black border border-[#00D1FF]/30 rounded-[24px] shadow-[0_0_20px_rgba(0,209,255,0.2)]">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-[#00D1FF]" style={{ textShadow: "0 0 5px rgba(0, 209, 255, 0.3)" }}>
            {notification.title}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <p className="text-white/90 text-base leading-relaxed">
            {notification.description}
          </p>
          <p className="text-sm text-[#00D1FF]/60 mt-4">{formattedDate}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationDialog;
