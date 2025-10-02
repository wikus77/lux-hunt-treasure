// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Helper per popolare knowledge base (chiamare una volta)

import { supabase } from '@/integrations/supabase/client';
import { SEED_DOCUMENTS } from '@/intel/norah/kb/seedDocuments';

export interface PopulateKBOptions {
  documents?: typeof SEED_DOCUMENTS;
  force?: boolean;
}

export async function populateKnowledgeBase(options: PopulateKBOptions = {}) {
  const docs = options.documents ?? SEED_DOCUMENTS;

  try {
    console.log('📚 [NORAH KB] Popolamento Knowledge Base in corso...');
    console.log(`📄 [NORAH KB] Documenti da processare: ${docs.length}`);

    const { data, error } = await supabase.functions.invoke('norah-kb-upsert', {
      body: { documents: docs }
    });

    if (error) {
      console.error('❌ [NORAH KB] Errore edge function:', error);
      throw new Error(`KB upsert failed: ${error.message || JSON.stringify(error)}`);
    }

    console.log('✅ [NORAH KB] Knowledge Base popolata:', data);
    console.log(`📊 [NORAH KB] Processati: ${data?.processed || 0}/${data?.total || docs.length}`);
    
    if (data?.results) {
      data.results.forEach((r: any) => {
        const status = r.status === 'ok' ? '✅' : '❌';
        console.log(`${status} [NORAH KB] ${r.slug}: ${r.chunks || 0} chunks`);
      });
    }

    return data;
  } catch (error) {
    console.error('❌ [NORAH KB] Errore popolamento:', error);
    throw error;
  }
}

// Esponi la funzione globalmente per debug
declare global {
  interface Window {
    __populateKB__: typeof populateKnowledgeBase;
  }
}

if (typeof window !== 'undefined') {
  window.__populateKB__ = populateKnowledgeBase;
  console.log('✅ window.__populateKB__ disponibile');
}
