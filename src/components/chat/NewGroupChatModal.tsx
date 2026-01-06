/**
 * New Group Chat Modal - Create group conversations
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, User, Loader2, Users, Check, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useChat } from '@/hooks/useChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { sanitizeSearchInput } from '@/utils/inputSanitizer';
import { toast } from 'sonner';

interface Agent {
  id: string;
  username: string | null;
  full_name: string | null;
  nickname: string | null;  // ✅ FIX: nickname è pubblico, full_name è privato (RLS)
  avatar_url: string | null;
  agent_code: string | null;
}

interface NewGroupChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: (conversationId: string, groupName: string) => void;
}

export function NewGroupChatModal({ isOpen, onClose, onGroupCreated }: NewGroupChatModalProps) {
  const { user } = useUnifiedAuth();
  const { createGroupChat } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>([]);
  const [groupName, setGroupName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [step, setStep] = useState<'select' | 'name'>('select');

  // Search agents
  useEffect(() => {
    if (!isOpen) return;
    
    const searchAgents = async () => {
      setIsLoading(true);
      try {
        // ✅ FIX: Aggiungo nickname (pubblico) - full_name può essere null per RLS
        let query = supabase
          .from('profiles')
          .select('id, username, full_name, nickname, avatar_url, agent_code')
          .neq('id', user?.id) // Exclude self
          .order('nickname', { ascending: true, nullsFirst: false })
          .limit(50);

        if (searchQuery.trim()) {
          const sanitized = sanitizeSearchInput(searchQuery);
          if (sanitized) {
            // ✅ FIX: Ricerca su nickname (pubblico) + agent_code
            query = query.or(`nickname.ilike.%${sanitized}%,agent_code.ilike.%${sanitized}%,full_name.ilike.%${sanitized}%`);
          }
        }

        const { data, error } = await query;

        if (error) {
          console.error('[NewGroupChatModal] Error:', error);
          return;
        }

        setAgents((data || []) as Agent[]);
      } catch (err) {
        console.error('[NewGroupChatModal] Exception:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchAgents, 300);
    return () => clearTimeout(debounce);
  }, [isOpen, searchQuery, user?.id]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setSelectedAgents([]);
      setGroupName('');
      setStep('select');
      setSearchQuery('');
    }
  }, [isOpen]);

  const toggleAgent = (agent: Agent) => {
    setSelectedAgents(prev => {
      const isSelected = prev.some(a => a.id === agent.id);
      if (isSelected) {
        return prev.filter(a => a.id !== agent.id);
      } else {
        if (prev.length >= 20) {
          toast.warning('Massimo 20 membri per gruppo');
          return prev;
        }
        return [...prev, agent];
      }
    });
  };

  // ✅ FIX: Priorità al nome reale (nickname è pubblico, full_name privato per RLS)
  const getDisplayName = (agent: Agent) => {
    // nickname è il campo pubblico per i nomi utente
    if (agent.nickname && agent.nickname.trim()) {
      return agent.nickname;
    }
    // full_name come fallback (potrebbe essere null per RLS)
    if (agent.full_name && agent.full_name.trim()) {
      return agent.full_name;
    }
    // username se diverso dal codice agente
    if (agent.username && agent.username.trim() && agent.username !== agent.agent_code) {
      return agent.username;
    }
    // Ultimo fallback: agent_code
    return agent.agent_code || 'Agente';
  };
  
  // ✅ Mostra SEMPRE il codice agente sotto il nome
  const shouldShowAgentCode = (agent: Agent) => {
    return agent.agent_code && agent.agent_code.trim() !== '';
  };

  const handleNext = () => {
    if (selectedAgents.length < 1) {
      toast.error('Seleziona almeno un membro');
      return;
    }
    setStep('name');
  };

  const handleBack = () => {
    setStep('select');
  };

  const handleCreate = async () => {
    if (!groupName.trim()) {
      toast.error('Inserisci un nome per il gruppo');
      return;
    }

    if (selectedAgents.length < 1) {
      toast.error('Seleziona almeno un membro');
      return;
    }

    setIsCreating(true);
    try {
      const memberIds = selectedAgents.map(a => a.id);
      const conversationId = await createGroupChat(memberIds, groupName.trim());
      
      if (conversationId) {
        toast.success('Gruppo creato con successo!');
        onGroupCreated(conversationId, groupName.trim());
        onClose();
      } else {
        toast.error('Errore nella creazione del gruppo');
      }
    } catch (err) {
      console.error('[NewGroupChatModal] Error creating group:', err);
      toast.error('Errore nella creazione del gruppo');
    } finally {
      setIsCreating(false);
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
          className="relative w-full max-w-md max-h-[85vh] overflow-hidden rounded-2xl"
          style={{
            background: 'linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(30,41,59,0.98) 100%)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            boxShadow: '0 0 40px rgba(168, 85, 247, 0.2), 0 25px 50px rgba(0, 0, 0, 0.5)',
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
                  background: 'radial-gradient(circle at 30% 30%, rgba(168,85,247,0.2), rgba(236,72,153,0.3) 80%)',
                  border: '1px solid rgba(168, 85, 247, 0.3)',
                }}
              >
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-orbitron">
                  {step === 'select' ? 'Nuovo Gruppo' : 'Nome del Gruppo'}
                </h2>
                <p className="text-xs text-gray-400">
                  {step === 'select' 
                    ? `${selectedAgents.length} membri selezionati`
                    : 'Scegli un nome per il gruppo'
                  }
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {step === 'select' ? (
            <>
              {/* Search */}
              <div className="p-4 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cerca agenti..."
                    className="w-full bg-gray-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                    autoFocus
                  />
                </div>
              </div>

              {/* Selected Agents Preview */}
              {selectedAgents.length > 0 && (
                <div className="px-4 py-3 border-b border-white/10 bg-purple-500/10">
                  <div className="flex flex-wrap gap-2">
                    {selectedAgents.map(agent => (
                      <motion.span
                        key={agent.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="flex items-center gap-1.5 px-2 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-xs text-purple-300"
                      >
                        {getDisplayName(agent)}
                        <button
                          onClick={() => toggleAgent(agent)}
                          className="hover:text-red-400 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.span>
                    ))}
                  </div>
                </div>
              )}

              {/* Agents List */}
              <div className="overflow-y-auto max-h-[40vh] p-4 space-y-2">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                  </div>
                ) : agents.length === 0 ? (
                  <div className="text-center py-8">
                    <User className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">
                      {searchQuery ? 'Nessun agente trovato' : 'Nessun agente disponibile'}
                    </p>
                  </div>
                ) : (
                  agents.map((agent) => {
                    const isSelected = selectedAgents.some(a => a.id === agent.id);
                    return (
                      <motion.button
                        key={agent.id}
                        onClick={() => toggleAgent(agent)}
                        className={`w-full p-3 rounded-xl border transition-all flex items-center gap-3 text-left ${
                          isSelected
                            ? 'bg-purple-500/20 border-purple-500/50'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-500/30'
                        }`}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        {/* Avatar */}
                        {agent.avatar_url ? (
                          <img
                            src={agent.avatar_url}
                            alt={getDisplayName(agent)}
                            className="w-10 h-10 rounded-full object-cover border-2 border-purple-500/30"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-purple-500/20 border-2 border-purple-500/30 flex items-center justify-center">
                            <span className="text-lg font-bold text-purple-400">
                              {getDisplayName(agent).charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}

                        {/* Info - ✅ FIX: Mostra SEMPRE nome E codice agente */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">
                            {agent.nickname || agent.full_name || agent.username || 'Agente'}
                          </p>
                          {agent.agent_code && (
                            <p className="text-xs text-purple-400/70 font-mono">{agent.agent_code}</p>
                          )}
                        </div>

                        {/* Selection indicator */}
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-700 text-gray-500'
                        }`}>
                          {isSelected ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </div>
                      </motion.button>
                    );
                  })
                )}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10">
                <Button
                  onClick={handleNext}
                  disabled={selectedAgents.length < 1}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50"
                >
                  Continua ({selectedAgents.length} selezionati)
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Group Name Input */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-500/30 border-2 border-purple-500/40 flex items-center justify-center">
                    <Users className="w-10 h-10 text-purple-400" />
                  </div>
                </div>

                <Input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Nome del gruppo..."
                  maxLength={50}
                  className="bg-gray-800/50 border-white/10 text-white text-center text-lg font-semibold placeholder-gray-500 focus:border-purple-500/50"
                  autoFocus
                />

                <p className="text-center text-xs text-gray-500">
                  {selectedAgents.length} membri: {selectedAgents.map(a => getDisplayName(a)).join(', ')}
                </p>
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-white/10 flex gap-3">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                >
                  Indietro
                </Button>
                <Button
                  onClick={handleCreate}
                  disabled={isCreating || !groupName.trim()}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50"
                >
                  {isCreating ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'Crea Gruppo'
                  )}
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default NewGroupChatModal;

