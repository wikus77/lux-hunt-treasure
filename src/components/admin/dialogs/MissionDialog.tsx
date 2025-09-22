
import { useState, useEffect } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Mission {
  id: string;
  title: string;
  description: string | null;
  publication_date: string | null;
  status: string;
  created_at: string | null;
  updated_at: string | null;
}

interface MissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (mission: Partial<Mission>) => void;
  title: string;
  confirmButtonText: string;
  mission?: Mission | null;
}

export const MissionDialog = ({
  open,
  onOpenChange,
  onSubmit,
  title,
  confirmButtonText,
  mission
}: MissionDialogProps) => {
  const [missionData, setMissionData] = useState<Partial<Mission>>({
    title: "",
    description: "",
    status: "draft",
    publication_date: null
  });

  // Reset form when dialog opens/closes or mission changes
  useEffect(() => {
    if (open && mission) {
      setMissionData({
        title: mission.title || "",
        description: mission.description || "",
        status: mission.status || "draft",
        publication_date: mission.publication_date || null
      });
    } else if (open) {
      setMissionData({
        title: "",
        description: "",
        status: "draft",
        publication_date: null
      });
    }
  }, [open, mission]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(missionData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Titolo
              </Label>
              <Input
                id="title"
                value={missionData.title}
                onChange={(e) => setMissionData({...missionData, title: e.target.value})}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descrizione
              </Label>
              <Textarea
                id="description"
                value={missionData.description || ""}
                onChange={(e) => setMissionData({...missionData, description: e.target.value})}
                className="col-span-3"
                rows={4}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Stato
              </Label>
              <Select
                value={missionData.status}
                onValueChange={(value) => setMissionData({...missionData, status: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleziona stato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Bozza</SelectItem>
                  <SelectItem value="published">Pubblicata</SelectItem>
                  <SelectItem value="scheduled">Programmata</SelectItem>
                  <SelectItem value="archived">Archiviata</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {missionData.status === "published" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="publication_date" className="text-right">
                  Data di pubblicazione
                </Label>
                <Input
                  id="publication_date"
                  type="datetime-local"
                  value={missionData.publication_date ? 
                    new Date(missionData.publication_date).toISOString().slice(0, 16) : 
                    new Date().toISOString().slice(0, 16)}
                  onChange={(e) => setMissionData({
                    ...missionData, 
                    publication_date: e.target.value ? new Date(e.target.value).toISOString() : null
                  })}
                  className="col-span-3"
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annulla
            </Button>
            <Button type="submit">{confirmButtonText}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
