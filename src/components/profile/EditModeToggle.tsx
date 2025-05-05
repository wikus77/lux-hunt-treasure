
import { Edit, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface EditModeToggleProps {
  isEditing: boolean;
  setIsEditing: (isEditing: boolean) => void;
  onSave: () => void;
}

const EditModeToggle = ({
  isEditing,
  setIsEditing,
  onSave
}: EditModeToggleProps) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="fixed bottom-24 sm:bottom-20 right-4 z-40">
      <Button
        onClick={() => isEditing ? onSave() : setIsEditing(true)}
        size="icon"
        className={`${isMobile ? 'w-10 h-10' : 'w-11 h-11'} rounded-full shadow-lg bg-gradient-to-r from-projectx-blue to-projectx-pink`}
      >
        {isEditing ? (
          <Save className={`h-4 w-4`} />
        ) : (
          <Edit className={`h-4 w-4`} />
        )}
      </Button>
    </div>
  );
};

export default EditModeToggle;
