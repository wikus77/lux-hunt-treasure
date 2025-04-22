
import { Edit, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

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
  return (
    <div className="fixed bottom-20 right-4 z-40">
      <Button
        onClick={() => isEditing ? onSave() : setIsEditing(true)}
        size="icon"
        className="w-12 h-12 rounded-full shadow-lg bg-gradient-to-r from-projectx-blue to-projectx-pink"
      >
        {isEditing ? (
          <Save className="h-5 w-5" />
        ) : (
          <Edit className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
};

export default EditModeToggle;
