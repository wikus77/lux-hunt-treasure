
import React from 'react';
import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, UserPlus, Mail, CheckCircle2, XCircle } from 'lucide-react';
import { PreRegistration } from '@/hooks/admin/usePreRegistrations';

interface PreRegistrationsTableProps {
  preRegistrations: PreRegistration[] | undefined;
  isLoading: boolean;
  error: Error | null;
  onConfirmEmail: (email: string) => void;
  onAddCredits: (email: string) => void;
  onCreateUser: (email: string) => void;
}

export const PreRegistrationsTable: React.FC<PreRegistrationsTableProps> = ({
  preRegistrations,
  isLoading,
  error,
  onConfirmEmail,
  onAddCredits,
  onCreateUser
}) => {
  if (isLoading) {
    return <p>Caricamento...</p>;
  }

  if (error) {
    return <p>Errore: {error.message}</p>;
  }

  return (
    <Table>
      <TableCaption>Elenco delle pre-registrazioni.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">#</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Data di Registrazione</TableHead>
          <TableHead>Referrer</TableHead>
          <TableHead>Codice di Riferimento</TableHead>
          <TableHead>Crediti</TableHead>
          <TableHead>Agent Code</TableHead>
          <TableHead>Confermato</TableHead>
          <TableHead className="text-right">Azioni</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {preRegistrations?.map((preReg) => (
          <TableRow key={preReg.id}>
            <TableCell className="font-medium">{preReg.numero_progressivo}</TableCell>
            <TableCell>{preReg.name}</TableCell>
            <TableCell>{preReg.email}</TableCell>
            <TableCell>{format(new Date(preReg.created_at), "dd MMMM yyyy, HH:mm", { locale: it })}</TableCell>
            <TableCell>{preReg.referrer}</TableCell>
            <TableCell>
              {preReg.referral_code}
            </TableCell>
            <TableCell>{preReg.credits}</TableCell>
            <TableCell>{preReg.agent_code}</TableCell>
            <TableCell>
              {preReg.confirmed ? (
                <Badge variant="outline">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Si
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <XCircle className="mr-2 h-4 w-4" />
                  No
                </Badge>
              )}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end gap-2">
                {!preReg.confirmed && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => onConfirmEmail(preReg.email)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onAddCredits(preReg.email)}
                >
                  <UserPlus className="h-4 w-4" />
                </Button>
                {!preReg.user_id && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onCreateUser(preReg.email)}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Crea Utente
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
