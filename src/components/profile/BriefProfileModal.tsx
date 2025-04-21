
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { User } from "lucide-react";

interface BriefProfileModalProps {
  open: boolean;
  onClose: () => void;
}

// For mock: in a real app, you'd fetch these from user state or context
const user = {
  name: "Mario Rossi",
  image: null,
  email: "mario.rossi@email.com",
  bio: "Appassionato di auto di lusso. Amo la velocità!",
}

const BriefProfileModal = ({ open, onClose }: BriefProfileModalProps) => {
  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent
        side="bottom"
        className="mx-auto max-w-sm bg-black text-white rounded-t-2xl py-8"
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-projectx-neon-blue bg-projectx-deep-blue flex items-center justify-center mb-3">
            {user.image ? (
              <img src={user.image} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-10 h-10 text-projectx-neon-blue" />
            )}
          </div>
          <div className="text-lg font-bold">{user.name}</div>
          <div className="text-xs text-projectx-neon-blue">{user.email}</div>
          <div className="text-sm text-gray-300 text-center">{user.bio}</div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default BriefProfileModal;
