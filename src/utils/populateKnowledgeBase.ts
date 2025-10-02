// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Helper per popolare knowledge base (chiamare una volta)

export async function populateKnowledgeBase() {
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

  try {
    console.log('📚 Popolamento Knowledge Base in corso...');

    const response = await fetch(
      `${SUPABASE_URL}/functions/v1/populate-knowledge-base`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({}),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    const result = await response.json();
    console.log('✅ Knowledge Base popolata:', result);
    return result;
  } catch (error) {
    console.error('❌ Errore popolamento KB:', error);
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
