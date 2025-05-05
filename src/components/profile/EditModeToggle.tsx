
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
        className={`${isMobile ? 'w-11 h-11' : 'w-12 h-12'} rounded-full shadow-lg bg-gradient-to-r from-projectx-blue to-projectx-pink`}
      >
        {isEditing ? (
          <Save className={`${isMobile ? 'h-5 w-5' : 'h-5 w-5'}`} />
        ) : (
          <Edit className={`${isMobile ? 'h-5 w-5' : 'h-5 w-5'}`} />
        )}
      </Button>
    </div>
  );
};

export default EditModeToggle;
