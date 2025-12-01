/**
 * New Group Modal - Create group chat with multiple members
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Users, Loader2, Check, UserPlus } from 'lucide-react';
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

interface NewGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGroupCreated: (conversationId: string, groupName: string) => void;
}

export function NewGroupModal({ isOpen, onClose, onGroupCreated }: NewGroupModalProps) {
  const { user } = useUnifiedAuth();
  const { createGroupChat } = useChat();
  const [step, setStep] = useState<'members' | 'name'>('members');
  const [searchQuery, setSearchQuery] = useState('');
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<Agent[]>([]);
  const [groupName, setGroupName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('members');
      setSearchQuery('');
      setSelectedMembers([]);
      setGroupName('');
    }
  }, [isOpen]);

  // Search agents
  useEffect(() => {
    if (!isOpen) return;
    
    const searchAgents = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from('profiles')
          .select('id, username, avatar_url, agent_code')
          .neq('id', user?.id || '') // Exclude self for groups
          .limit(30);

        if (searchQuery.trim()) {
          query = query.or(`username.ilike.%${searchQuery}%,agent_code.ilike.%${searchQuery}%`);
        }

        const { data, error } = await query;

        if (error) {
          console.error('[NewGroupModal] Search error:', error);
          return;
        }

        setAgents((data || []) as Agent[]);
      } catch (err) {
        console.error('[NewGroupModal] Exception:', err);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchAgents, 300);
    return () => clearTimeout(debounce);
  }, [isOpen, searchQuery, user?.id]);

  const toggleMember = (agent: Agent) => {
    setSelectedMembers(prev => {
      const exists = prev.find(m => m.id === agent.id);
      if (exists) {
        return prev.filter(m => m.id !== agent.id);
      }
      return [...prev, agent];
    });
  };

  const handleNextStep = () => {
    if (selectedMembers.length >= 1) {
      setStep('name');
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedMembers.length < 1) return;
    
    setIsCreating(true);
    try {
      const memberIds = selectedMembers.map(m => m.id);
      const conversationId = await createGroupChat(memberIds, groupName.trim());
      
      if (conversationId) {
        onGroupCreated(conversationId, groupName.trim());
        onClose();
      }
    } catch (err) {
      console.error('[NewGroupModal] Error creating group:', err);
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
            border: '1px solid rgba(139, 92, 246, 0.3)',
            boxShadow: '0 0 40px rgba(139, 92, 246, 0.15), 0 25px 50px rgba(0, 0, 0, 0.5)',
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
                  background: 'radial-gradient(circle at 30% 30%, rgba(139,92,246,0.3), rgba(168,85,247,0.4) 80%)',
                  border: '1px solid rgba(139, 92, 246, 0.4)',
                }}
              >
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-orbitron">
                  {step === 'members' ? 'Nuovo Gruppo' : 'Nome Squadra'}
                </h2>
                <p className="text-xs text-gray-400">
                  {step === 'members' 
                    ? `Seleziona i membri (${selectedMembers.length} selezionati)`
                    : 'Scegli un nome per la squadra'
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

          {step === 'members' ? (
            <>
              {/* Search */}
              <div className="p-4 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cerca agenti da aggiungere..."
                    className="w-full bg-gray-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors"
                    autoFocus
                  />
                </div>

                {/* Selected Members Preview */}
                {selectedMembers.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {selectedMembers.map(member => (
                      <motion.span
                        key={member.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm text-purple-300"
                      >
                        {member.username || member.agent_code}
                        <button 
                          onClick={() => toggleMember(member)}
                          className="hover:text-red-400 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </motion.span>
                    ))}
                  </div>
                )}
              </div>

              {/* Agents List */}
              <div className="overflow-y-auto max-h-[40vh] p-4 space-y-2">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
                  </div>
                ) : agents.length === 0 ? (
                  <div className="text-center py-8">
                    <UserPlus className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">
                      {searchQuery ? 'Nessun agente trovato' : 'Cerca agenti da aggiungere'}
                    </p>
                  </div>
                ) : (
                  agents.map((agent) => {
                    const isSelected = selectedMembers.some(m => m.id === agent.id);
                    return (
                      <motion.button
                        key={agent.id}
                        onClick={() => toggleMember(agent)}
                        className={`w-full p-3 rounded-xl border transition-all flex items-center gap-3 text-left ${
                          isSelected 
                            ? 'bg-purple-500/20 border-purple-500/40' 
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-purple-500/30'
                        }`}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        {/* Avatar */}
                        {agent.avatar_url ? (
                          <img
                            src={agent.avatar_url}
                            alt={agent.username || 'Agent'}
                            className="w-10 h-10 rounded-full object-cover border-2 border-purple-500/30"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-purple-500/20 border-2 border-purple-500/30 flex items-center justify-center">
                            <span className="text-lg font-bold text-purple-400">
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
                            <p className="text-xs text-purple-400/70">{agent.agent_code}</p>
                          )}
                        </div>

                        {/* Check indicator */}
                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                          isSelected 
                            ? 'bg-purple-500 border-purple-500' 
                            : 'border-gray-500'
                        }`}>
                          {isSelected && <Check className="w-4 h-4 text-white" />}
                        </div>
                      </motion.button>
                    );
                  })
                )}
              </div>

              {/* Footer - Next Button */}
              <div className="p-4 border-t border-white/10">
                <Button
                  onClick={handleNextStep}
                  disabled={selectedMembers.length < 1}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50"
                >
                  Continua ({selectedMembers.length} membri)
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* Name Input */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Nome della Squadra</label>
                  <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Es: Squadra Alpha, Team Milano..."
                    className="w-full bg-gray-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 transition-colors text-lg"
                    autoFocus
                    maxLength={50}
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {groupName.length}/50 caratteri
                  </p>
                </div>

                {/* Members Preview */}
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Membri ({selectedMembers.length + 1} incluso te)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-sm text-cyan-300">
                      Tu (Admin)
                    </span>
                    {selectedMembers.map(member => (
                      <span
                        key={member.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-sm text-purple-300"
                      >
                        {member.username || member.agent_code}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer - Create Button */}
              <div className="p-4 border-t border-white/10 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('members')}
                  disabled={isCreating}
                  className="flex-1 border-gray-600 text-gray-300"
                >
                  Indietro
                </Button>
                <Button
                  onClick={handleCreateGroup}
                  disabled={!groupName.trim() || isCreating}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                >
                  {isCreating ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Users className="w-4 h-4 mr-2" />
                  )}
                  Crea Squadra
                </Button>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default NewGroupModal;

