
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AppMessage {
  id: string;
  title: string;
  content: string;
  message_type: string;
  target_users: string[];
  is_active: boolean;
  is_read: boolean;
  created_at: string | null;
  updated_at: string | null;
  expiry_date: string | null;
}

interface MessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (message: Partial<AppMessage>) => void;
  title: string;
  confirmButtonText: string;
  message?: AppMessage | null;
}

export const MessageDialog = ({
  open,
  onOpenChange,
  onSubmit,
  title,
  confirmButtonText,
  message
}: MessageDialogProps) => {
  const [messageData, setMessageData] = useState<Partial<AppMessage>>({
    title: "",
    content: "",
    message_type: "info",
    target_users: ["all"],
    is_active: true,
    is_read: false,
    expiry_date: null
  });

  const [hasExpiry, setHasExpiry] = useState(false);

  // Reset form when dialog opens/closes or message changes
  useEffect(() => {
    if (open && message) {
      setMessageData({
        title: message.title || "",
        content: message.content || "",
        message_type: message.message_type || "info",
        target_users: message.target_users || ["all"],
        is_active: message.is_active !== undefined ? message.is_active : true,
        is_read: message.is_read !== undefined ? message.is_read : false,
        expiry_date: message.expiry_date || null
      });
      setHasExpiry(!!message.expiry_date);
    } else if (open) {
      setMessageData({
        title: "",
        content: "",
        message_type: "info",
        target_users: ["all"],
        is_active: true,
        is_read: false,
        expiry_date: null
      });
      setHasExpiry(false);
    }
  }, [open, message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If no expiry date is set, ensure the field is null
    const finalMessageData = {
      ...messageData,
      expiry_date: hasExpiry ? messageData.expiry_date : null
    };
    
    onSubmit(finalMessageData);
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
                value={messageData.title}
                onChange={(e) => setMessageData({...messageData, title: e.target.value})}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="content" className="text-right">
                Contenuto
              </Label>
              <Textarea
                id="content"
                value={messageData.content || ""}
                onChange={(e) => setMessageData({...messageData, content: e.target.value})}
                className="col-span-3"
                rows={4}
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="message_type" className="text-right">
                Tipo
              </Label>
              <Select
                value={messageData.message_type}
                onValueChange={(value) => setMessageData({...messageData, message_type: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleziona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="target_users" className="text-right">
                Destinatari
              </Label>
              <Select
                value={messageData.target_users?.includes("all") ? "all" : "specific"}
                onValueChange={(value) => {
                  if (value === "all") {
                    setMessageData({...messageData, target_users: ["all"]});
                  } else {
                    setMessageData({...messageData, target_users: []});
                  }
                }}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleziona destinatari" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti gli utenti</SelectItem>
                  <SelectItem value="specific">Utenti specifici</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {!messageData.target_users?.includes("all") && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="specific_users" className="text-right">
                  Lista utenti
                </Label>
                <Input
                  id="specific_users"
                  placeholder="Inserisci ID utenti separati da virgola"
                  className="col-span-3"
                  value={(messageData.target_users || []).join(", ")}
                  onChange={(e) => {
                    const value = e.target.value;
                    const users = value.split(",").map(id => id.trim()).filter(id => id !== "");
                    setMessageData({...messageData, target_users: users});
                  }}
                />
              </div>
            )}
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_active" className="text-right">
                Attivo
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="is_active"
                  checked={messageData.is_active}
                  onCheckedChange={(checked) => setMessageData({...messageData, is_active: checked})}
                />
                <Label htmlFor="is_active">
                  {messageData.is_active ? "Il messaggio è visibile agli utenti" : "Il messaggio è nascosto"}
                </Label>
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="has_expiry" className="text-right">
                Data di scadenza
              </Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="has_expiry"
                  checked={hasExpiry}
                  onCheckedChange={setHasExpiry}
                />
                <Label htmlFor="has_expiry">
                  {hasExpiry ? "Il messaggio scadrà" : "Il messaggio non scade"}
                </Label>
              </div>
            </div>
            
            {hasExpiry && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="expiry_date" className="text-right">
                  Scadenza
                </Label>
                <Input
                  id="expiry_date"
                  type="datetime-local"
                  value={messageData.expiry_date ? 
                    new Date(messageData.expiry_date).toISOString().slice(0, 16) : 
                    ""}
                  onChange={(e) => setMessageData({
                    ...messageData, 
                    expiry_date: e.target.value ? new Date(e.target.value).toISOString() : null
                  })}
                  className="col-span-3"
                  required={hasExpiry}
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
