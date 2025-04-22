
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
      <DialogContent className="max-w-md bg-black border border-projectx-blue">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-white">
            {notification.title}
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <p className="text-white/90 text-base leading-relaxed">
            {notification.description}
          </p>
          <p className="text-sm text-muted-foreground mt-4">{formattedDate}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationDialog;
