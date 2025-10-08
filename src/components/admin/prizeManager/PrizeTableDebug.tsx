
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
      console.log("Verifico l'esistenza della tabella prize_clues...");
      
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
      }
      
      setTableStatus({
        checking: false,
        exists: false,
        error: error.message
      });
    } catch (error) {
      console.error("Errore generale durante la verifica:", error);
      setTableStatus({
        checking: false,
        exists: false,
        error: `Errore verifica: ${error.message}`
      });
    }
  };
  
  useEffect(() => {
    checkPrizeCluesTable();
  }, [retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const projectRef = supabaseUrl?.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];

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
            
            <div className="mt-3 flex flex-wrap gap-3">
              <Button onClick={handleRetry} variant="outline" size="sm">
                <RefreshCw className="mr-2 h-3 w-3" />
                Riprova verifica
              </Button>

              {projectRef && (
                <Button 
                  onClick={() => window.open(`https://supabase.com/dashboard/project/${projectRef}/sql/new`, '_blank')}
                  variant="secondary"
                  size="sm"
                >
                  <Code className="mr-2 h-3 w-3" />
                  SQL Editor
                </Button>
              )}
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
    </div>
  );
};

export default PrizeTableDebug;
