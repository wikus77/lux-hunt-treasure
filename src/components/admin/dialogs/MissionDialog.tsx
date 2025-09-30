
"use client";

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
import { supabase } from "@/integrations/supabase/client";

interface Prize {
  id: string;
  name: string | null;
  description: string | null;
  image_url: string | null;
}

interface Mission {
  id: string;
  title: string;
  description: string | null;
  publication_date: string | null;
  status: string;
  created_at: string | null;
  updated_at: string | null;
  prize_id: string | null;
  start_date: string | null;
  end_date: string | null;
  prize_description: string | null;
  prize_value: string | null;
  prize_image_url: string | null;
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
    publication_date: null,
    start_date: null,
    end_date: null,
    prize_id: null,
    prize_description: "",
    prize_value: "",
    prize_image_url: ""
  });
  const [prizes, setPrizes] = useState<Prize[]>([]);

  // Load prizes and reset form when dialog opens
  useEffect(() => {
    if (open) {
      loadPrizes();
      if (mission) {
        setMissionData({
          title: mission.title || "",
          description: mission.description || "",
          status: mission.status || "draft",
          publication_date: mission.publication_date || null,
          start_date: mission.start_date || null,
          end_date: mission.end_date || null,
          prize_id: mission.prize_id || null,
          prize_description: mission.prize_description || "",
          prize_value: mission.prize_value || "",
          prize_image_url: mission.prize_image_url || ""
        });
      } else {
        setMissionData({
          title: "",
          description: "",
          status: "draft",
          publication_date: null,
          start_date: null,
          end_date: null,
          prize_id: null,
          prize_description: "",
          prize_value: "",
          prize_image_url: ""
        });
      }
    }
  }, [open, mission]);

  const loadPrizes = async () => {
    try {
      const { data, error } = await supabase
        .from('prizes')
        .select('id, name, description, image_url')
        .eq('is_active', true);
      
      if (error) throw error;
      setPrizes(data || []);
    } catch (error) {
      console.error('Error loading prizes:', error);
    }
  };

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
                value={missionData.status || undefined}
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
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start_date" className="text-right">
                Data inizio
              </Label>
              <Input
                id="start_date"
                type="datetime-local"
                value={missionData.start_date ? 
                  new Date(missionData.start_date).toISOString().slice(0, 16) : ""}
                onChange={(e) => setMissionData({
                  ...missionData, 
                  start_date: e.target.value ? new Date(e.target.value).toISOString() : null
                })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end_date" className="text-right">
                Data fine
              </Label>
              <Input
                id="end_date"
                type="datetime-local"
                value={missionData.end_date ? 
                  new Date(missionData.end_date).toISOString().slice(0, 16) : ""}
                onChange={(e) => setMissionData({
                  ...missionData, 
                  end_date: e.target.value ? new Date(e.target.value).toISOString() : null
                })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="prize_id" className="text-right">
                Premio
              </Label>
               <Select
                value={missionData.prize_id || undefined}
                onValueChange={(value) => setMissionData({...missionData, prize_id: value === 'none' ? null : value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleziona premio (opzionale)" />
                </SelectTrigger>
                 <SelectContent>
                  <SelectItem value="none">Nessun premio</SelectItem>
                  {prizes.map((prize) => (
                    <SelectItem key={prize.id} value={prize.id}>
                      {prize.name || "Premio senza nome"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="prize_description" className="text-right">
                Descrizione premio
              </Label>
              <Textarea
                id="prize_description"
                value={missionData.prize_description || ""}
                onChange={(e) => setMissionData({...missionData, prize_description: e.target.value})}
                className="col-span-3"
                rows={2}
                placeholder="Descrizione personalizzata del premio"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="prize_value" className="text-right">
                Valore premio
              </Label>
              <Input
                id="prize_value"
                value={missionData.prize_value || ""}
                onChange={(e) => setMissionData({...missionData, prize_value: e.target.value})}
                className="col-span-3"
                placeholder="es. €100, 50 punti, accesso VIP"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="prize_image_url" className="text-right">
                Immagine premio
              </Label>
              <Input
                id="prize_image_url"
                value={missionData.prize_image_url || ""}
                onChange={(e) => setMissionData({...missionData, prize_image_url: e.target.value})}
                className="col-span-3"
                placeholder="URL immagine premio"
              />
            </div>
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
