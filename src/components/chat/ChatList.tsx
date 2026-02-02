/**
 * Chat List - Shows all conversations with swipe-to-delete
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState } from 'react';
import { motion, AnimatePresence, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { MessageCircle, Users, Clock, ChevronRight, Plus, Loader2, Trash2, X } from 'lucide-react';
import { useChat, Conversation } from '@/hooks/useChat';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';

interface ChatListProps {
  onSelectConversation: (conversationId: string, name: string, avatar: string | null, originRect: DOMRect | null) => void;
  onNewChat: () => void;
  onNewGroup?: () => void;
}

export function ChatList({ onSelectConversation, onNewChat, onNewGroup }: ChatListProps) {
  const { conversations, isLoading, error, totalUnreadCount, deleteConversation } = useChat();
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async (conversationId: string) => {
    setIsDeleting(true);
    try {
      await deleteConversation(conversationId);
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting conversation:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <MessageCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <p className="text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header with New Chat button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-cyan-400" />
          <span className="text-white font-semibold">Messaggi</span>
          {totalUnreadCount > 0 && (
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
              {totalUnreadCount} nuovi
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={onNewChat}
            size="sm"
            className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
          >
            <Plus className="w-4 h-4 mr-1" />
            Chat
          </Button>
          {onNewGroup && (
            <Button
              onClick={onNewGroup}
              size="sm"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
            >
              <Users className="w-4 h-4 mr-1" />
              Gruppo
            </Button>
          )}
        </div>
      </div>

      {/* Conversations List */}
      {conversations.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <MessageCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Nessun messaggio</h3>
          <p className="text-gray-400 text-sm mb-4">
            Inizia una nuova conversazione con un altro agente!
          </p>
          <Button
            onClick={onNewChat}
            className="bg-gradient-to-r from-cyan-600 to-purple-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nuova Chat
          </Button>
        </motion.div>
      ) : (
        <AnimatePresence mode="popLayout">
          {conversations.map((conversation, index) => {
            const displayName = conversation.conversation_type === 'group' 
              ? conversation.conversation_name 
              : conversation.other_user_username;
            
            // DEBUG: Log per verificare i dati
            console.log('[ChatList] Conv:', {
              id: conversation.conversation_id,
              type: conversation.conversation_type,
              name: conversation.conversation_name,
              other_user: conversation.other_user_username,
              displayName
            });
            
            return (
              <SwipeableConversationItem
                key={conversation.conversation_id}
                conversation={conversation}
                onClick={(e: React.MouseEvent) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  console.log('[ChatList] Selected:', displayName || 'Chat');
                  onSelectConversation(
                    conversation.conversation_id, 
                    displayName || 'Chat',
                    conversation.other_user_avatar,
                    rect
                  );
                }}
                onDelete={() => setDeleteConfirm(conversation.conversation_id)}
                index={index}
              />
            );
          })}
        </AnimatePresence>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[6000] flex items-center justify-center p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-sm bg-gray-900 border border-red-500/30 rounded-2xl p-6 shadow-2xl"
            >
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-8 h-8 text-red-400" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">
                  Eliminare questa chat?
                </h3>
                <p className="text-gray-400 text-sm mb-6">
                  Tutti i messaggi verranno eliminati permanentemente. Questa azione non può essere annullata.
                </p>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteConfirm(null)}
                    disabled={isDeleting}
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <X className="w-4 h-4 mr-2" />
                    No, annulla
                  </Button>
                  <Button
                    onClick={() => handleDeleteConfirm(deleteConfirm)}
                    disabled={isDeleting}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  >
                    {isDeleting ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Trash2 className="w-4 h-4 mr-2" />
                    )}
                    Sì, elimina
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface SwipeableConversationItemProps {
  conversation: Conversation;
  onClick: (e: React.MouseEvent) => void;
  onDelete: () => void;
  index: number;
}

function SwipeableConversationItem({ conversation, onClick, onDelete, index }: SwipeableConversationItemProps) {
  const x = useMotionValue(0);
  const [isDragging, setIsDragging] = useState(false);
  
  // Transform for delete button opacity
  const deleteOpacity = useTransform(x, [-100, -50, 0], [1, 0.5, 0]);
  const deleteScale = useTransform(x, [-100, -50, 0], [1, 0.8, 0.5]);

  const isGroup = conversation.conversation_type === 'group';
  const displayName = conversation.other_user_username || conversation.conversation_name || 'Chat';
  const hasUnread = conversation.unread_count > 0;

  const timeAgo = conversation.last_message_at
    ? formatDistanceToNow(new Date(conversation.last_message_at), { 
        addSuffix: false, 
        locale: it 
      })
    : null;

  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);
    if (info.offset.x < -80) {
      // Swiped far enough - show delete confirmation
      onDelete();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (!isDragging) {
      onClick(e);
    }
  };

  // 🔧 FIX: Colore bordo sinistro in base all'index (come leaderboard)
  const getBorderColor = () => {
    if (hasUnread) return 'linear-gradient(180deg, #00D1FF 0%, #3B82F6 100%)';
    if (index === 0) return 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)';
    if (index === 1) return 'linear-gradient(180deg, #C0C0C0 0%, #A0A0A0 100%)';
    if (index === 2) return 'linear-gradient(180deg, #CD7F32 0%, #8B4513 100%)';
    return 'linear-gradient(180deg, #00D1FF 0%, #0891B2 100%)';
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100, height: 0 }}
      transition={{ delay: index * 0.03 }}
      style={{ position: 'relative', overflow: 'hidden', borderRadius: '16px' }}
    >
      {/* Delete background */}
      <motion.div 
        style={{ 
          position: 'absolute', 
          top: 0, 
          bottom: 0, 
          right: 0, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'flex-end', 
          paddingRight: '16px', 
          background: '#DC2626', 
          borderRadius: '16px',
          opacity: deleteOpacity 
        }}
      >
        <motion.div style={{ scale: deleteScale, display: 'flex', alignItems: 'center', gap: '8px', color: '#FFFFFF' }}>
          <Trash2 style={{ width: '20px', height: '20px' }} />
          <span style={{ fontSize: '14px', fontWeight: 500 }}>Elimina</span>
        </motion.div>
      </motion.div>

      {/* Swipeable card - 🔧 FIX: Stile Leaderboard (sfondo chiaro, bordo colorato a sinistra) */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -100, right: 0 }}
        dragElastic={0.1}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{ 
          x,
          position: 'relative',
          padding: '14px 16px',
          borderRadius: '16px',
          cursor: 'pointer',
          // 🔧 FIX: Sfondo chiaro come Leaderboard
          background: '#FFFFFF',
          border: '1px solid rgba(0, 0, 0, 0.06)',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
          overflow: 'hidden',
        }}
        onClick={handleClick}
      >
        {/* 🔧 FIX: Bordo colorato a sinistra come Leaderboard */}
        <div style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: '4px',
          background: getBorderColor(),
          borderRadius: '4px 0 0 4px',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            {conversation.other_user_avatar ? (
              <img
                src={conversation.other_user_avatar}
                alt={displayName}
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid rgba(0, 209, 255, 0.3)',
                }}
              />
            ) : (
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isGroup ? 'rgba(168, 85, 247, 0.15)' : 'rgba(0, 209, 255, 0.15)',
                border: `2px solid ${isGroup ? 'rgba(168, 85, 247, 0.3)' : 'rgba(0, 209, 255, 0.3)'}`,
              }}>
                {isGroup ? (
                  <Users style={{ width: '20px', height: '20px', color: '#A855F7' }} />
                ) : (
                  <span style={{ fontSize: '18px', fontWeight: 700, color: '#0891B2' }}>
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
            )}
            
            {/* Unread badge */}
            {hasUnread && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '20px',
                height: '20px',
                background: '#00D1FF',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                fontWeight: 700,
                color: '#FFFFFF',
              }}>
                {conversation.unread_count > 9 ? '9+' : conversation.unread_count}
              </span>
            )}
          </div>

          {/* Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <span style={{ 
                fontWeight: 600, 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap',
                // 🔧 FIX: Testo scuro su sfondo chiaro
                color: hasUnread ? '#111827' : '#374151',
                fontSize: '15px',
              }}>
                {displayName}
              </span>
              {timeAgo && (
                <span style={{ fontSize: '12px', color: '#9CA3AF', whiteSpace: 'nowrap' }}>
                  {timeAgo}
                </span>
              )}
            </div>
            
            {conversation.last_message && (
              <p style={{ 
                fontSize: '13px', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap',
                marginTop: '2px',
                // 🔧 FIX: Testo scuro su sfondo chiaro
                color: hasUnread ? '#4B5563' : '#9CA3AF',
                fontWeight: hasUnread ? 500 : 400,
              }}>
                {conversation.last_message}
              </p>
            )}
          </div>

          {/* Arrow */}
          <ChevronRight style={{ width: '20px', height: '20px', color: '#9CA3AF', flexShrink: 0 }} />
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ChatList;
