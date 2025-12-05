/**
 * New Chat Modal - Search and start new conversation
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, User, Loader2, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useChat } from '@/hooks/useChat';
import { Button } from '@/components/ui/button';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

interface Agent {
  id: string;
  username: string;
  avatar_url: string | null;
  agent_code: string | null;
}

interface NewChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onChatCreated: (conversationId: string, recipientName: string, recipientAvatar: string | null) => void;
}

export function NewChatModal({ isOpen, onClose, onChatCreated }: NewChatModalProps) {
  const { user } = useUnifiedAuth();
  const { createDirectChat } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState<string | null>(null);

  // Search agents - Carica TUTTI gli utenti reali dalla tabella profiles
  useEffect(() => {
    if (!isOpen) return;
    
    const searchAgents = async () => {
      setIsLoading(true);
      try {
        console.log('[NewChatModal] 🔍 Cercando agenti...');
        
        // Query diretta senza filtri iniziali per vedere TUTTI gli utenti
        let query = supabase
          .from('profiles')
          .select('id, username, avatar_url, agent_code')
          .order('username', { ascending: true })
          .limit(50); // Aumentato per vedere più utenti

        if (searchQuery.trim()) {
          query = query.or(`username.ilike.%${searchQuery}%,agent_code.ilike.%${searchQuery}%`);
        }

        const { data, error } = await query;

        console.log('[NewChatModal] 📊 Risultato:', { count: data?.length, error, data });

        if (error) {
          console.error('[NewChatModal] ❌ Errore query:', error);
          return;
        }

        // MOSTRA TUTTI - anche quelli con solo agent_code
        console.log('[NewChatModal] ✅ Agenti trovati:', data?.length || 0);
        setAgents((data || []) as Agent[]);
      } catch (err) {
        console.error('[NewChatModal] ❌ Exception:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchAgents, 300);
    return () => clearTimeout(debounce);
  }, [isOpen, searchQuery, user?.id]);

  const handleSelectAgent = async (agent: Agent) => {
    setIsCreating(agent.id);
    try {
      const conversationId = await createDirectChat(agent.id);
      if (conversationId) {
        onChatCreated(conversationId, agent.username, agent.avatar_url);
        onClose();
      }
    } catch (err) {
      console.error('[NewChatModal] Error creating chat:', err);
    } finally {
      setIsCreating(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[5000] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-md max-h-[80vh] overflow-hidden rounded-2xl"
          style={{
            background: 'linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(30,41,59,0.98) 100%)',
            border: '1px solid rgba(0, 255, 255, 0.2)',
            boxShadow: '0 0 40px rgba(0, 255, 255, 0.15), 0 25px 50px rgba(0, 0, 0, 0.5)',
          }}
          initial={{ scale: 0.9, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.9, y: 20, opacity: 0 }}
          transition={{ type: 'spring', damping: 25 }}
        >
          {/* Header */}
          <div className="relative px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div 
                className="p-2.5 rounded-xl"
                style={{
                  background: 'radial-gradient(circle at 30% 30%, rgba(0,255,255,0.2), rgba(139,92,246,0.3) 80%)',
                  border: '1px solid rgba(0, 255, 255, 0.3)',
                }}
              >
                <MessageCircle className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-orbitron">Nuova Chat</h2>
                <p className="text-xs text-gray-400">Cerca un agente</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca per username o codice agente..."
                className="w-full bg-gray-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 transition-colors"
                autoFocus
              />
            </div>
          </div>

          {/* Agents List */}
          <div className="overflow-y-auto max-h-[50vh] p-4 space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
              </div>
            ) : agents.length === 0 ? (
              <div className="text-center py-8">
                <User className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">
                  {searchQuery ? 'Nessun agente trovato per "' + searchQuery + '"' : 'Nessun agente disponibile'}
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  Prova a cercare per codice agente (es. AGT-12345)
                </p>
              </div>
            ) : (
              agents.map((agent) => (
                <motion.button
                  key={agent.id}
                  onClick={() => handleSelectAgent(agent)}
                  disabled={isCreating !== null}
                  className="w-full p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/30 transition-all flex items-center gap-3 text-left disabled:opacity-50"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {/* Avatar */}
                  {agent.avatar_url ? (
                    <img
                      src={agent.avatar_url}
                      alt={agent.username || agent.agent_code || 'Agent'}
                      className="w-10 h-10 rounded-full object-cover border-2 border-cyan-500/30"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 border-2 border-cyan-500/30 flex items-center justify-center">
                      <span className="text-lg font-bold text-cyan-400">
                        {(agent.username || agent.agent_code || 'A')?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">
                      {agent.username || agent.agent_code || 'Agente'}
                    </p>
                    {agent.agent_code && agent.username && (
                      <p className="text-xs text-cyan-400/70">{agent.agent_code}</p>
                    )}
                  </div>

                  {/* Loading indicator */}
                  {isCreating === agent.id ? (
                    <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                  ) : (
                    <MessageCircle className="w-5 h-5 text-gray-500" />
                  )}
                </motion.button>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default NewChatModal;

