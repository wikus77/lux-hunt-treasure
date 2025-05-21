
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Database, RefreshCw, ArrowRight } from "lucide-react";

const PrizeTableDebug = () => {
  const [tableStatus, setTableStatus] = useState<{
    checking: boolean;
    exists?: boolean;
    error?: string;
    detailedError?: string;
    creationAttempted?: boolean;
  }>({
    checking: true
  });
  
  const [creationResult, setCreationResult] = useState<any>(null);

  const checkPrizeCluesTable = async () => {
    setTableStatus({ checking: true });
    
    try {
      // First, try to check via direct query with type assertion to bypass TypeScript error
      const { data, error } = await supabase
        .from('prize_clues' as any)
        .select('count(*)', { count: 'exact', head: true });
        
      if (error) {
        if (error.message.includes('relation "prize_clues" does not exist') || 
            error.message.includes("relation") && error.message.includes("does not exist")) {
          console.log("Table doesn't exist:", error.message);
          setTableStatus({ 
            checking: false, 
            exists: false,
            error: "La tabella 'prize_clues' non esiste nel database."
          });
        } else {
          throw error;
        }
      } else {
        console.log("Table exists, count result:", data);
        setTableStatus({ 
          checking: false, 
          exists: true 
        });
      }
    } catch (error) {
      console.error("Error checking table:", error);
      
      // Try using the edge function as a fallback
      try {
        console.log("Attempting to check/create table via edge function");
        const response = await fetch(
          "https://vkjrqirvdvjbemsfzxof.functions.supabase.co/create-prize-clues-table",
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`,
            }
          }
        );
        
        const result = await response.json();
        console.log("Edge function response:", result);
        setCreationResult(result);
        
        if (response.ok) {
          setTableStatus({
            checking: false,
            exists: result.exists || result.created,
            creationAttempted: true,
            error: (!result.exists && !result.created) ? result.message : undefined
          });
        } else {
          throw new Error(`API check failed: ${response.status} - ${result.error || result.message || 'Unknown error'}`);
        }
      } catch (apiError) {
        console.error("Error checking via API:", apiError);
        setTableStatus({ 
          checking: false, 
          error: `Errore durante la verifica della tabella: ${error.message}`,
          detailedError: apiError.message
        });
      }
    }
  };
  
  // Check table status on mount
  useEffect(() => {
    checkPrizeCluesTable();
  }, []);

  const handleCreateTable = async () => {
    setTableStatus({ checking: true });
    
    try {
      console.log("Attempting to create table via edge function");
      const response = await fetch(
        "https://vkjrqirvdvjbemsfzxof.functions.supabase.co/create-prize-clues-table",
        {
          method: "POST", // Using POST to indicate we want to create the table
          headers: {
            "Authorization": `Bearer ${(await supabase.auth.getSession()).data.session?.access_token || ''}`,
          }
        }
      );
      
      const result = await response.json();
      console.log("Edge function create response:", result);
      setCreationResult(result);
      
      if (response.ok) {
        setTableStatus({
          checking: false,
          exists: result.exists || result.created,
          creationAttempted: true,
          error: (!result.exists && !result.created) ? result.message : undefined
        });
      } else {
        throw new Error(`API creation failed: ${response.status} - ${result.error || 'Unknown error'}`);
      }
    } catch (apiError) {
      console.error("Error creating table via API:", apiError);
      setTableStatus({ 
        checking: false,
        creationAttempted: true, 
        error: `Errore durante la creazione della tabella: ${apiError.message}`,
      });
    }
  };

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
            {tableStatus.detailedError && (
              <div className="mt-1 text-xs text-red-300">
                Dettaglio: {tableStatus.detailedError}
              </div>
            )}
            
            <div className="mt-3 flex space-x-3">
              <Button 
                onClick={handleCreateTable}
                variant="destructive"
                size="sm"
              >
                <Database className="mr-2 h-3 w-3" />
                Crea tabella
              </Button>
              
              <Button 
                onClick={checkPrizeCluesTable}
                variant="outline" 
                size="sm"
              >
                <RefreshCw className="mr-2 h-3 w-3" />
                Riprova verifica
              </Button>
            </div>
            
            <div className="mt-3 p-3 bg-black/30 rounded text-xs font-mono overflow-auto">
              <p>La tabella può essere creata manualmente eseguendo la seguente query SQL:</p>
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
            {tableStatus.creationAttempted && (
              <p className="text-green-300 text-sm mt-1">
                {creationResult?.exists 
                  ? "La tabella era già presente nel database."
                  : "La tabella è stata creata con successo."}
              </p>
            )}
          </AlertDescription>
        </Alert>
      ) : null}
      
      <div className="flex space-x-3 mt-3">
        <Button 
          onClick={checkPrizeCluesTable}
          disabled={tableStatus.checking}
          variant="outline" 
          size="sm"
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
        
        {!tableStatus.exists && !tableStatus.checking && (
          <Button 
            onClick={handleCreateTable}
            variant="default"
            size="sm"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Database className="mr-2 h-3 w-3" />
            Crea tabella prize_clues
          </Button>
        )}
      </div>
      
      {creationResult && (
        <div className="mt-4 p-3 bg-gray-900/30 border border-gray-800 rounded text-xs overflow-auto">
          <details>
            <summary className="cursor-pointer text-blue-400 hover:text-blue-300">
              Dettagli operazione <ArrowRight className="inline h-3 w-3 ml-1" />
            </summary>
            <pre className="mt-2 text-gray-300 whitespace-pre-wrap">
              {JSON.stringify(creationResult, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
};

export default PrizeTableDebug;
