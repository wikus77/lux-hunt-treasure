// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
// Tool Schemas for AI Function Calling

import { ToolSchema } from '@/types/ai-gateway.types';

export const TOOL_SCHEMAS: ToolSchema[] = [
  {
    name: 'get_user_state',
    description: 'Legge lo stato completo dell\'utente: tier, progressi, notifiche, BUZZ disponibili',
    parameters: {
      type: 'object',
      properties: {
        userId: { 
          type: 'string', 
          description: 'ID utente (UUID)' 
        }
      },
      required: ['userId']
    }
  },
  {
    name: 'get_nearby_prizes',
    description: 'Trova premi e aree rilevanti entro un raggio dalla posizione utente',
    parameters: {
      type: 'object',
      properties: {
        lat: { 
          type: 'number', 
          description: 'Latitudine' 
        },
        lng: { 
          type: 'number', 
          description: 'Longitudine' 
        },
        radiusKm: { 
          type: 'number', 
          description: 'Raggio di ricerca in km', 
          default: 5 
        }
      },
      required: ['lat', 'lng']
    }
  },
  {
    name: 'retrieve_docs',
    description: 'RAG: cerca risposte su regole, FAQ, policy, changelog M1SSION',
    parameters: {
      type: 'object',
      properties: {
        query: { 
          type: 'string', 
          description: 'Query di ricerca semantica' 
        },
        k: { 
          type: 'integer', 
          description: 'Numero di risultati', 
          default: 6 
        }
      },
      required: ['query']
    }
  },
  {
    name: 'open_support_ticket',
    description: 'Apre un ticket di supporto per problemi tecnici o richieste utente',
    parameters: {
      type: 'object',
      properties: {
        userId: { 
          type: 'string', 
          description: 'ID utente' 
        },
        issue: { 
          type: 'string', 
          description: 'Descrizione del problema' 
        },
        category: { 
          type: 'string', 
          description: 'Categoria: technical, billing, gameplay, other',
          enum: ['technical', 'billing', 'gameplay', 'other']
        }
      },
      required: ['userId', 'issue']
    }
  }
];

export function getToolSchemaByName(name: string): ToolSchema | undefined {
  return TOOL_SCHEMAS.find(schema => schema.name === name);
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
