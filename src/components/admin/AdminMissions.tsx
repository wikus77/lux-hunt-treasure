
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { MissionDialog } from "@/components/admin/dialogs/MissionDialog";
import { DeleteConfirmationDialog } from "@/components/admin/dialogs/DeleteConfirmationDialog";
import { PlusCircle, Edit, Trash2 } from "lucide-react";

interface Mission {
  id: string;
  title: string;
  description: string | null;
  publication_date: string | null;
  status: string;
  created_at: string | null;
  updated_at: string | null;
}

export const AdminMissions = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentMission, setCurrentMission] = useState<Mission | null>(null);

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('missions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setMissions(data || []);
    } catch (error: any) {
      toast.error("Errore nel caricamento delle missioni", {
        description: error.message
      });
      console.error("Error fetching missions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateMission = async (missionData: Partial<Mission>) => {
    try {
      // Ensure required fields are present
      if (!missionData.title) {
        toast.error("Il titolo è obbligatorio");
        return;
      }

      // Fix: Change from array to single object for insert
      const { data, error } = await supabase
        .from('missions')
        .insert({
          title: missionData.title,
          description: missionData.description || null,
          publication_date: missionData.publication_date || null,
          status: missionData.status || 'draft'
        })
        .select();

      if (error) {
        throw error;
      }

      toast.success("Missione creata con successo");
      fetchMissions();
    } catch (error: any) {
      toast.error("Errore nella creazione della missione", {
        description: error.message
      });
      console.error("Error creating mission:", error);
    }
  };

  const handleUpdateMission = async (missionData: Partial<Mission>) => {
    if (!currentMission) return;

    try {
      // Ensure required fields
      if (!missionData.title) {
        toast.error("Il titolo è obbligatorio");
        return;
      }

      const { error } = await supabase
        .from('missions')
        .update({
          ...missionData,
          updated_at: new Date().toISOString()
        })
        .eq('id', currentMission.id);

      if (error) {
        throw error;
      }

      toast.success("Missione aggiornata con successo");
      fetchMissions();
    } catch (error: any) {
      toast.error("Errore nell'aggiornamento della missione", {
        description: error.message
      });
      console.error("Error updating mission:", error);
    }
  };

  const handleDeleteMission = async () => {
    if (!currentMission) return;

    try {
      const { error } = await supabase
        .from('missions')
        .delete()
        .eq('id', currentMission.id);

      if (error) {
        throw error;
      }

      toast.success("Missione eliminata con successo");
      fetchMissions();
    } catch (error: any) {
      toast.error("Errore nell'eliminazione della missione", {
        description: error.message
      });
      console.error("Error deleting mission:", error);
    }
  };

  const openEditDialog = (mission: Mission) => {
    setCurrentMission(mission);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (mission: Mission) => {
    setCurrentMission(mission);
    setIsDeleteDialogOpen(true);
  };

  if (isLoading) {
    return <div className="flex justify-center p-8"><Spinner /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Gestione Missioni</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <PlusCircle size={16} className="mr-2" />
          Nuova Missione
        </Button>
      </div>

      <Table>
        <TableCaption>Lista delle missioni disponibili</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Titolo</TableHead>
            <TableHead>Stato</TableHead>
            <TableHead>Data di Pubblicazione</TableHead>
            <TableHead className="text-right">Azioni</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {missions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                Nessuna missione disponibile
              </TableCell>
            </TableRow>
          ) : (
            missions.map((mission) => (
              <TableRow key={mission.id}>
                <TableCell className="font-medium">{mission.title}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    mission.status === 'published' ? 'bg-green-100 text-green-800' :
                    mission.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {mission.status === 'published' ? 'Pubblicata' :
                     mission.status === 'draft' ? 'Bozza' :
                     mission.status}
                  </span>
                </TableCell>
                <TableCell>
                  {mission.publication_date 
                    ? new Date(mission.publication_date).toLocaleDateString('it-IT') 
                    : 'Non pubblicata'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(mission)}>
                      <Edit size={16} />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(mission)}>
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Create Mission Dialog */}
      <MissionDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateMission}
        title="Crea Nuova Missione"
        confirmButtonText="Crea"
      />

      {/* Edit Mission Dialog */}
      <MissionDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSubmit={handleUpdateMission}
        title="Modifica Missione"
        confirmButtonText="Salva Modifiche"
        mission={currentMission}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog 
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDeleteMission}
        title="Elimina Missione"
        description={`Sei sicuro di voler eliminare la missione "${currentMission?.title}"? Questa azione è irreversibile.`}
      />
    </div>
  );
};
