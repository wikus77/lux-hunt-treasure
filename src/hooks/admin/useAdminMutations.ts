
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Mutation per confermare l'email
export const useConfirmEmailMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (email: string) => {
      const { data, error } = await supabase
        .from('pre_registrations')
        .update({ confirmed: true })
        .eq('email', email);

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pre_registrations'] });
      toast("Successo", {
        description: "Email confermata con successo.",
      });
    },
    onError: (error: Error) => {
      toast.error("Errore", {
        description: error.message,
      });
    }
  });
};

// Mutation per aggiungere crediti
export const useAddCreditsMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ email, credits }: { email: string; credits: number }) => {
      const { data, error } = await supabase
        .from('pre_registrations')
        .update({ credits: credits })
        .eq('email', email);

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pre_registrations'] });
      toast("Successo", {
        description: "Crediti aggiunti con successo.",
      });
    },
    onError: (error: Error) => {
      toast.error("Errore", {
        description: error.message,
      });
    }
  });
};

// Mutation per creare un nuovo utente
export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (email: string) => {
      const { data, error } = await supabase.functions.invoke('create-user-from-preregistration', {
        body: { email: email }
      });

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pre_registrations'] });
      toast("Successo", {
        description: "Utente creato con successo.",
      });
    },
    onError: (error: Error) => {
      toast.error("Errore", {
        description: error.message,
      });
    }
  });
};
