
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Database, RefreshCw } from "lucide-react";

const PrizeTableDebug = () => {
  const [tableStatus, setTableStatus] = useState<{
    checking: boolean;
    exists?: boolean;
    error?: string;
  }>({
    checking: true
  });

  const checkPrizeCluesTable = async () => {
    setTableStatus({ checking: true });
    
    try {
      // First, try to check via direct query with type assertion to bypass TypeScript error
      const { data, error } = await supabase
        .from('prize_clues' as any)
        .select('count(*)', { count: 'exact', head: true });
        
      if (error) {
        if (error.message.includes('relation "prize_clues" does not exist')) {
          setTableStatus({ 
            checking: false, 
            exists: false,
            error: "La tabella 'prize_clues' non esiste nel database."
          });
        } else {
          throw error;
        }
      } else {
        setTableStatus({ 
          checking: false, 
          exists: true 
        });
      }
    } catch (error) {
      console.error("Error checking table:", error);
      
      // Try using the edge function as a fallback
      try {
        const response = await fetch(
          "https://vkjrqirvdvjbemsfzxof.functions.supabase.co/create-prize-clues-table",
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`,
            }
          }
        );
        
        if (response.ok) {
          const result = await response.json();
          setTableStatus({
            checking: false,
            exists: result.exists,
            error: result.exists ? undefined : result.message
          });
        } else {
          throw new Error(`API check failed: ${response.status}`);
        }
      } catch (apiError) {
        console.error("Error checking via API:", apiError);
        setTableStatus({ 
          checking: false, 
          error: `Errore durante la verifica della tabella: ${error.message}` 
        });
      }
    }
  };
  
  // Check table status on mount
  useEffect(() => {
    checkPrizeCluesTable();
  }, []);

  return (
    <div className="mt-6 p-4 border border-gray-700 rounded-lg bg-black/40">
      <h3 className="text-lg font-medium flex items-center mb-3">
        <Database className="mr-2 h-5 w-5 text-blue-400" />
        Diagnostica Database
      </h3>
      
      {tableStatus.checking ? (
        <div className="flex items-center">
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          <p>Verifica tabelle in corso...</p>
        </div>
      ) : tableStatus.error ? (
        <Alert variant="destructive" className="bg-red-900/20 border-red-800 mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-red-300">Problema rilevato</AlertTitle>
          <AlertDescription className="text-red-200">
            {tableStatus.error}
            
            <div className="mt-3 p-3 bg-black/30 rounded text-xs font-mono overflow-auto">
              <p>Per risolvere, crea la tabella eseguendo la seguente query SQL:</p>
              <pre className="mt-2 text-green-400 whitespace-pre-wrap">
{`CREATE TABLE public.prize_clues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prize_id UUID REFERENCES public.prizes(id) NOT NULL,
  week INTEGER NOT NULL,
  clue_type TEXT NOT NULL DEFAULT 'regular',
  title_it TEXT NOT NULL,
  title_en TEXT,
  title_fr TEXT,
  description_it TEXT NOT NULL,
  description_en TEXT,
  description_fr TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.prize_clues ENABLE ROW LEVEL SECURITY;

-- Add policy for admins
CREATE POLICY "Admin users can manage prize clues"
  ON public.prize_clues
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');
`}
              </pre>
            </div>
          </AlertDescription>
        </Alert>
      ) : tableStatus.exists ? (
        <Alert variant="default" className="bg-green-900/20 border-green-800">
          <CheckCircle className="h-4 w-4 text-green-500" />
          <AlertTitle>Tabella pronta</AlertTitle>
          <AlertDescription>
            La tabella 'prize_clues' è presente e pronta per memorizzare gli indizi.
          </AlertDescription>
        </Alert>
      ) : null}
      
      <Button 
        onClick={checkPrizeCluesTable}
        disabled={tableStatus.checking}
        variant="outline" 
        size="sm"
        className="mt-3"
      >
        {tableStatus.checking ? (
          <>
            <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
            Verifica in corso...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-3 w-3" />
            Verifica stato tabelle
          </>
        )}
      </Button>
    </div>
  );
};

export default PrizeTableDebug;
