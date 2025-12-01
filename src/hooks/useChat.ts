/**
 * Chat Hook - Manages conversations and messages
 * Uses Supabase RPC functions for encrypted messaging
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from './useUnifiedAuth';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface Conversation {
  conversation_id: string;
  conversation_type: 'direct' | 'group';
  conversation_name: string | null;
  other_user_id: string | null;
  other_user_username: string | null;
  other_user_avatar: string | null;
  last_message: string | null;
  last_message_at: string | null;
  last_message_sender_id: string | null;
  unread_count: number;
  is_muted: boolean;
}

export interface ChatMessage {
  message_id: string;
  sender_id: string;
  sender_username: string;
  sender_avatar: string | null;
  content: string;
  message_type: 'text' | 'location' | 'system';
  metadata: Record<string, any>;
  created_at: string;
  is_own: boolean;
}

export function useChat() {
  const { user } = useUnifiedAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!user?.id) {
      setConversations([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase.rpc('get_my_conversations');

      if (rpcError) {
        console.error('[useChat] Error loading conversations:', rpcError);
        setError('Errore nel caricamento delle conversazioni');
        return;
      }

      setConversations((data || []) as Conversation[]);
    } catch (err) {
      console.error('[useChat] Exception:', err);
      setError('Errore imprevisto');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Create or get direct chat with another user
  const createDirectChat = useCallback(async (otherUserId: string): Promise<string | null> => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase.rpc('get_or_create_direct_chat', {
        p_other_user_id: otherUserId
      });

      if (error) {
        console.error('[useChat] Error creating chat:', error);
        return null;
      }

      // Refresh conversations
      await loadConversations();

      return data as string;
    } catch (err) {
      console.error('[useChat] Exception creating chat:', err);
      return null;
    }
  }, [user?.id, loadConversations]);

  // Get total unread count
  const totalUnreadCount = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

  // Create a new group chat
  const createGroupChat = useCallback(async (
    memberIds: string[], 
    groupName: string
  ): Promise<string | null> => {
    if (!user?.id) return null;
    if (memberIds.length < 1) return null;

    try {
      // Include current user in members
      const allMembers = [...new Set([user.id, ...memberIds])];

      const { data, error } = await supabase.rpc('create_group_chat', {
        p_member_ids: allMembers,
        p_group_name: groupName.trim()
      });

      if (error) {
        console.error('[useChat] Error creating group:', error);
        return null;
      }

      // Refresh conversations
      await loadConversations();

      return data as string;
    } catch (err) {
      console.error('[useChat] Exception creating group:', err);
      return null;
    }
  }, [user?.id, loadConversations]);

  // Delete a conversation
  const deleteConversation = useCallback(async (conversationId: string): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      // Delete membership (this will cascade delete if user is the only member)
      const { error } = await supabase
        .from('chat_members')
        .delete()
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

      if (error) {
        console.error('[useChat] Error deleting conversation:', error);
        return false;
      }

      // Remove from local state immediately
      setConversations(prev => prev.filter(c => c.conversation_id !== conversationId));
      
      return true;
    } catch (err) {
      console.error('[useChat] Exception deleting:', err);
      return false;
    }
  }, [user?.id]);

  // Subscribe to new messages for realtime updates
  useEffect(() => {
    if (!user?.id) return;

    // Initial load
    loadConversations();

    // Subscribe to chat_messages for realtime updates
    const channel = supabase
      .channel('chat-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          console.log('[useChat] New message received:', payload);
          // Refresh conversations to update last message and unread count
          loadConversations();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user?.id, loadConversations]);

  return {
    conversations,
    isLoading,
    error,
    totalUnreadCount,
    loadConversations,
    createDirectChat,
    createGroupChat,
    deleteConversation
  };
}

// Hook for individual conversation messages
export function useChatMessages(conversationId: string | null) {
  const { user } = useUnifiedAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Load messages
  const loadMessages = useCallback(async (before?: string) => {
    if (!user?.id || !conversationId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase.rpc('get_chat_messages', {
        p_conversation_id: conversationId,
        p_limit: 50,
        p_before: before || null
      });

      if (rpcError) {
        console.error('[useChatMessages] Error loading messages:', rpcError);
        setError('Errore nel caricamento dei messaggi');
        return;
      }

      // Messages come in DESC order, reverse for display
      const msgs = ((data || []) as ChatMessage[]).reverse();
      
      if (before) {
        // Prepend older messages
        setMessages(prev => [...msgs, ...prev]);
      } else {
        setMessages(msgs);
      }
    } catch (err) {
      console.error('[useChatMessages] Exception:', err);
      setError('Errore imprevisto');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, conversationId]);

  // Send message with OPTIMISTIC UPDATE (like WhatsApp!)
  const sendMessage = useCallback(async (
    content: string, 
    messageType: 'text' | 'location' = 'text',
    metadata: Record<string, any> = {}
  ): Promise<boolean> => {
    if (!user?.id || !conversationId || !content.trim()) return false;

    // Create optimistic message (appears immediately!)
    const optimisticId = `temp_${Date.now()}`;
    const optimisticMessage: ChatMessage = {
      message_id: optimisticId,
      sender_id: user.id,
      sender_username: 'Tu',
      sender_avatar: null,
      content: content.trim(),
      message_type: messageType,
      metadata,
      created_at: new Date().toISOString(),
      is_own: true
    };

    // Add message immediately (optimistic update)
    setMessages(prev => [...prev, optimisticMessage]);

    try {
      setIsSending(true);
      setError(null);

      const { data, error } = await supabase.rpc('send_chat_message', {
        p_conversation_id: conversationId,
        p_content: content.trim(),
        p_message_type: messageType,
        p_metadata: metadata
      });

      if (error) {
        console.error('[useChatMessages] Error sending message:', error);
        setError('Errore nell\'invio del messaggio');
        // Remove optimistic message on error
        setMessages(prev => prev.filter(m => m.message_id !== optimisticId));
        return false;
      }

      // Trigger push notification (fire-and-forget)
      supabase.functions.invoke('chat-push-notify', {
        body: {
          conversation_id: conversationId,
          sender_id: user.id,
          message_preview: content.trim().substring(0, 100)
        }
      }).catch(err => {
        console.warn('[useChatMessages] Push notification error:', err);
      });

      // Reload to get real message ID (replaces optimistic)
      setTimeout(() => loadMessages(), 300);

      return true;
    } catch (err) {
      console.error('[useChatMessages] Exception sending:', err);
      setError('Errore imprevisto');
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.message_id !== optimisticId));
      return false;
    } finally {
      setIsSending(false);
    }
  }, [user?.id, conversationId, loadMessages]);

  // Send location
  const sendLocation = useCallback(async (lat: number, lng: number): Promise<boolean> => {
    return sendMessage(
      `📍 Posizione condivisa`,
      'location',
      { lat, lng }
    );
  }, [sendMessage]);

  // Mark as read
  const markAsRead = useCallback(async () => {
    if (!conversationId) return;
    
    await supabase.rpc('mark_conversation_read', {
      p_conversation_id: conversationId
    });
  }, [conversationId]);

  // Subscribe to new messages - OPTIMIZED to avoid flickering
  useEffect(() => {
    if (!user?.id || !conversationId) return;

    // Initial load only once
    loadMessages();

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          const newMsg = payload.new as any;
          
          // Skip reload if it's our own message (already shown via optimistic)
          if (newMsg.sender_id === user.id) {
            // Just update the optimistic message silently
            setMessages(prev => prev.map(m => 
              m.is_optimistic ? { ...m, is_optimistic: false, message_id: newMsg.id } : m
            ));
            return;
          }
          
          // Message from someone else - reload
          await loadMessages();
          await markAsRead();
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [user?.id, conversationId]);

  return {
    messages,
    isLoading,
    isSending,
    error,
    sendMessage,
    sendLocation,
    loadMessages,
    markAsRead
  };
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
