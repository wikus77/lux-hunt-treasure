// © 2025 Joseph MULÉ – M1SSION™ – NORAH AI KB Seeder
// Populates knowledge base with essential M1SSION documents

import { supabase } from '@/integrations/supabase/client';
import { SEED_DOCUMENTS } from './seedDocuments';

export async function seedNorahKB(): Promise<{ success: boolean; processed: number; errors: string[] }> {
  console.log('[KB Seed] Starting knowledge base population...');
  
  const errors: string[] = [];
  let processed = 0;

  try {
    // Call kb-upsert edge function
    const { data, error } = await supabase.functions.invoke('norah-kb-upsert', {
      body: { documents: SEED_DOCUMENTS }
    });

    if (error) {
      console.error('[KB Seed] Edge function error:', error);
      errors.push(`Edge function error: ${error.message}`);
      return { success: false, processed: 0, errors };
    }

    console.log('[KB Seed] Response:', data);

    if (data?.processed) {
      processed = data.processed;
      console.log(`[KB Seed] Successfully processed ${processed}/${data.total} documents`);
      
      if (data.results) {
        data.results.forEach((result: any) => {
          console.log(`[KB Seed] ${result.slug}: ${result.status} (${result.chunks} chunks)`);
        });
      }
    }

    return { 
      success: processed > 0, 
      processed, 
      errors: data?.results?.filter((r: any) => r.status !== 'ok').map((r: any) => r.slug) || []
    };

  } catch (error) {
    console.error('[KB Seed] Fatal error:', error);
    errors.push(error instanceof Error ? error.message : 'Unknown error');
    return { success: false, processed: 0, errors };
  }
}

// Quick test function
export async function testRAGSearch(query: string = 'differenza BUZZ vs BUZZ Map'): Promise<any> {
  console.log(`[KB Test] Testing RAG search with query: "${query}"`);
  
  try {
    const { data, error } = await supabase.functions.invoke('norah-rag-search', {
      body: { query, k: 3 }
    });

    if (error) {
      console.error('[KB Test] RAG search error:', error);
      return { success: false, error: error.message };
    }

    console.log('[KB Test] RAG results:', data);
    return { success: true, results: data?.results || [], count: data?.count || 0 };

  } catch (error) {
    console.error('[KB Test] Fatal error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
