
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Database, RefreshCw, ArrowRight, Code } from "lucide-react";

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
  const [retryCount, setRetryCount] = useState(0);

  const checkPrizeCluesTable = async () => {
    setTableStatus({ checking: true });
    
    try {
      // Tenta la verifica diretta
      console.log("Verifico l'esistenza della tabella prize_clues...");
      
      // Prima, prova a verificare con una query diretta
      try {
        const { data, error } = await supabase
          .from('prize_clues')
          .select('count(*)', { count: 'exact', head: true });
          
        if (!error) {
          console.log("La tabella 'prize_clues' esiste:", data);
          setTableStatus({ 
            checking: false, 
            exists: true
          });
          return;
        } else {
          console.log("Errore verifica tabella (atteso se la tabella non esiste):", error.message);
        }
      } catch (checkError) {
        console.log("Errore verifica tabella (atteso se la tabella non esiste):", checkError.message);
      }
      
      // Se la query diretta fallisce, usa l'edge function
      console.log("Tentativo di verifica/creazione tabella tramite edge function");
      
      // Ottieni il token di accesso dell'utente corrente
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      
      console.log("Session:", JSON.stringify(sessionData, null, 2));
      console.log("User ID:", sessionData?.session?.user.id);
      console.log("User Data:", JSON.stringify({ user: sessionData?.session?.user }, null, 2));
      console.log("Access Token:", accessToken ? "Present" : "Missing");
      
      const response = await fetch(
        "https://vkjrqirvdvjbemsfzxof.functions.supabase.co/create-prize-clues-table",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { "Authorization": `Bearer ${accessToken}` } : {})
          },
          cache: "no-store"
        }
      );
      
      console.log(`Risposta edge function: ${response.status} ${response.statusText}`);
      
      let result;
      try {
        result = await response.json();
        console.log("Dettagli risposta edge function:", result);
      } catch (jsonError) {
        const text = await response.text();
        console.error(`Errore parsing risposta: ${jsonError.message}`, text);
        throw new Error(`Errore parsing risposta: ${text}`);
      }
      
      // Gestione della risposta
      if (response.ok) {
        setCreationResult(result);
        
        if (result.exists) {
          console.log("Edge function conferma: la tabella esiste");
          setTableStatus({
            checking: false,
            exists: true
          });
        } else if (result.created) {
          console.log("Edge function conferma: la tabella è stata creata");
          setTableStatus({
            checking: false,
            exists: true,
            creationAttempted: true
          });
        } else {
          console.log("Edge function non ha confermato né esistenza né creazione");
          setTableStatus({
            checking: false,
            exists: false,
            error: result.message || "Dettagli non disponibili",
            creationAttempted: true
          });
        }
      } else {
        console.error("Errore dall'edge function:", result);
        setTableStatus({
          checking: false,
          exists: false,
          error: result.error || "Errore sconosciuto dalla edge function",
          detailedError: JSON.stringify(result),
          creationAttempted: true
        });
        
        // Se l'errore include SQL, lo mostriamo per l'esecuzione manuale
        if (result.sql || result.manual_sql) {
          setCreationResult({
            ...result,
            sql: result.sql || result.manual_sql
          });
        }
      }
    } catch (error) {
      console.error("Errore generale durante la verifica:", error);
      
      setTableStatus({
        checking: false,
        exists: false,
        error: `Test diagnostico fallito: problema con SUPABASE_SERVICE_ROLE_KEY o rete. Dettaglio: ${error.message}`,
        detailedError: error.stack || JSON.stringify(error)
      });
    }
  };
  
  // Check table status on mount or when retryCount changes
  useEffect(() => {
    checkPrizeCluesTable();
  }, [retryCount]);

  const handleCreateTable = async () => {
    setTableStatus({ checking: true });
    
    try {
      console.log("Attempting to create table via edge function");
      
      // Ottieni il token di accesso dell'utente corrente
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      
      const response = await fetch(
        "https://vkjrqirvdvjbemsfzxof.functions.supabase.co/create-prize-clues-table",
        {
          method: "POST", // Using POST to indicate we want to create the table
          headers: {
            ...(accessToken ? { "Authorization": `Bearer ${accessToken}` } : {}),
            "Content-Type": "application/json"
          },
          cache: "no-store"
        }
      );
      
      let result;
      try {
        result = await response.json();
      } catch (e) {
        throw new Error(`Failed to parse response: ${await response.text()}`);
      }
      
      console.log("Edge function create response:", result);
      setCreationResult(result);
      
      if (!response.ok || result.error) {
        throw new Error(result.error || `API creation failed: ${response.status} - ${result.message || 'Unknown error'}`);
      }
      
      setTableStatus({
        checking: false,
        exists: result.exists || result.created,
        creationAttempted: true,
        error: (!result.exists && !result.created) ? result.message : undefined
      });
      
      // If table was created, verify it
      if (result.created) {
        try {
          // Delay for a moment to ensure table has been fully created
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { data, error } = await supabase
            .from('prize_clues')
            .select('count(*)', { count: 'exact', head: true });
            
          if (error) {
            throw new Error(`Verifica fallita: ${error.message}`);
          }
          
          console.log("Table verified successfully:", data);
        } catch (verifyError) {
          console.error("Table verification error:", verifyError);
        }
      }
      
    } catch (apiError) {
      console.error("Error creating table via API:", apiError);
      setTableStatus({ 
        checking: false,
        creationAttempted: true, 
        error: `Test diagnostico fallito: problema con SUPABASE_SERVICE_ROLE_KEY o rete. Dettaglio: ${apiError.message}`,
      });
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1); // This will trigger useEffect to re-run checkPrizeCluesTable
  };

  const handleManualCreate = async () => {
    // This is just a placeholder - in a real app, you'd show SQL to run or redirect to SQL editor
    setTableStatus({ checking: true });
    
    // Direct the user to the Supabase SQL editor
    window.open('https://supabase.com/dashboard/project/vkjrqirvdvjbemsfzxof/sql/new', '_blank');
    
    setTimeout(() => {
      setTableStatus(prev => ({...prev, checking: false}));
    }, 1000);
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
              <div className="mt-1 text-xs text-red-300 overflow-auto max-h-[200px]">
                <details>
                  <summary className="cursor-pointer">Mostra dettagli errore</summary>
                  <pre className="whitespace-pre-wrap">{tableStatus.detailedError}</pre>
                </details>
              </div>
            )}
            
            <div className="mt-3 flex flex-wrap gap-3">
              <Button 
                onClick={handleCreateTable}
                variant="destructive"
                size="sm"
              >
                <Database className="mr-2 h-3 w-3" />
                Crea tabella
              </Button>
              
              <Button 
                onClick={handleRetry}
                variant="outline" 
                size="sm"
              >
                <RefreshCw className="mr-2 h-3 w-3" />
                Riprova verifica
              </Button>

              <Button 
                onClick={handleManualCreate}
                variant="secondary"
                size="sm"
                className="bg-amber-900/50 border-amber-700/50 hover:bg-amber-700/30"
              >
                <Code className="mr-2 h-3 w-3" />
                SQL Editor
              </Button>
            </div>
            
            {creationResult?.sql && (
              <div className="mt-3 p-3 bg-black/30 rounded text-xs font-mono overflow-auto">
                <p>La tabella può essere creata manualmente eseguendo la seguente query SQL:</p>
                <pre className="mt-2 text-green-400 whitespace-pre-wrap">
                  {creationResult.sql}
                </pre>
              </div>
            )}
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
      
      <div className="flex flex-wrap gap-3 mt-3">
        <Button 
          onClick={handleRetry}
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
          <>
            <Button 
              onClick={handleCreateTable}
              variant="default"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Database className="mr-2 h-3 w-3" />
              Crea tabella prize_clues
            </Button>
            
            <Button 
              onClick={handleManualCreate}
              variant="secondary" 
              size="sm"
            >
              <Code className="mr-2 h-3 w-3" />
              Apri SQL Editor
            </Button>
          </>
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
