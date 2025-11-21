// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT

import React, { useState } from 'react';
import { getProjectRef } from '@/lib/supabase/functionsBase';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, RotateCcw, Shield } from "lucide-react";
import { toast } from "sonner";

export const MissionResetSection: React.FC = () => {
  const [isResetting, setIsResetting] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleReset = async () => {
    if (confirmationCode !== 'RESET_M1SSION_CONFIRM') {
      toast.error('Codice di conferma non valido');
      return;
    }

    setIsResetting(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Sessione non trovata');
      }

      console.log('🔄 Chiamata reset-mission con codice:', confirmationCode);
      console.log('👤 User session:', session.user.email);
      
      // Fix: Use fetch directly to properly send JSON body
      const supabaseUrl = `https://${getProjectRef()}.supabase.co`;
      const response = await fetch(`${supabaseUrl}/functions/v1/reset-mission`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'x-m1ssion-sig': 'official-client'
        },
        body: JSON.stringify({ confirmationCode })
      });
      
      const responseData = await response.json();
      
      console.log('📡 Risposta reset-mission:', response.status, responseData);
      console.log('🔧 Response details:', responseData);

      if (!response.ok) {
        throw new Error(responseData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = responseData;
      
      if (result.success) {
        // Show detailed success message with reset information
        const resetTables = result.tables_reset || [];
        const resetDate = result.reset_details?.reset_date;
        const daysRemaining = result.mission_status?.days_remaining || 30;
        
        toast.success('✅ RESET MISSIONE™ COMPLETATO', {
          description: `Missione completamente azzerata! ${resetTables.length} tabelle ripristinate. Giorni rimasti: ${daysRemaining}. La pagina si ricaricherà automaticamente.`
        });
        
        setShowConfirmation(false);
        setConfirmationCode('');
        
        // 🚨 TRIGGER MISSION RESET EVENT FOR BUZZ SYSTEM SYNC
        console.log('🔄 TRIGGERING MISSION RESET EVENT FOR BUZZ SYNC...');
        
        // Dispatch custom event to notify all components
        window.dispatchEvent(new CustomEvent('missionReset', {
          detail: { 
            resetDate: resetDate, 
            daysRemaining: daysRemaining,
            tablesReset: resetTables 
          }
        }));
        
        // Clear localStorage to trigger storage change event
        localStorage.clear();
        
        // Force page reload after 3 seconds to reflect all changes
        setTimeout(() => {
          window.location.reload();
        }, 3000);
        
      } else {
        throw new Error(result.error || 'Reset fallito');
      }

    } catch (error) {
      console.error('❌ Reset mission error:', error);
      toast.error('❌ ERRORE RESET MISSIONE', {
        description: error.message || 'Errore sconosciuto durante il reset'
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <RotateCcw className="h-5 w-5 text-destructive" />
          <CardTitle className="text-destructive">RESET MISSIONE™</CardTitle>
        </div>
        <CardDescription>
          Riavvia completamente la missione corrente - AZIONE IRREVERSIBILE
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>ATTENZIONE:</strong> Questa operazione eliminerà TUTTO:
            <ul className="list-disc ml-4 mt-2 space-y-1">
              <li>Stato missione (riportato a 30 giorni, 0% progresso)</li>
              <li>Tutti gli indizi trovati</li>
              <li>Tutte le aree mappa generate</li>
              <li>Contatori BUZZ giornalieri e mappa</li>
              <li>Tutte le notifiche utente</li>
              <li>Tentativi Final Shot</li>
              <li>Coordinate geo-radar</li>
              <li>Punti mappa salvati</li>
              <li>Uso strumenti intelligence</li>
              <li>Stato attività live</li>
            </ul>
            <p className="mt-2 font-semibold text-destructive">La missione ripartirà da ZERO con data di oggi!</p>
          </AlertDescription>
        </Alert>

        {!showConfirmation ? (
          <Button 
            variant="destructive" 
            onClick={() => setShowConfirmation(true)}
            className="w-full"
          >
            <Shield className="mr-2 h-4 w-4" />
            AVVIA RESET MISSIONE
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Inserisci il codice di conferma: <code className="bg-muted px-1 rounded">RESET_M1SSION_CONFIRM</code>
              </label>
              <Input
                type="text"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value)}
                placeholder="Inserisci il codice di conferma"
                className="font-mono"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="destructive" 
                onClick={handleReset}
                disabled={isResetting || confirmationCode !== 'RESET_M1SSION_CONFIRM'}
                className="flex-1"
              >
                {isResetting ? 'RESETTING...' : 'CONFERMA RESET'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowConfirmation(false);
                  setConfirmationCode('');
                }}
                disabled={isResetting}
              >
                Annulla
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};