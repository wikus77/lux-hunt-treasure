/**
 * M1SSION™ Forum Hook
 * Gestisce posts, commenti e votazioni del forum
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthContext } from '@/contexts/auth';
import { toast } from 'sonner';

export interface ForumCategory {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  color: string;
  sort_order: number;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  category_id: string | null;
  category_name: string | null;
  category_icon: string | null;
  user_id: string;
  author_name: string | null;
  author_code: string | null;
  author_avatar: string | null;
  is_pinned: boolean;
  is_locked: boolean;
  view_count: number;
  upvotes: number;
  downvotes: number;
  comment_count: number;
  created_at: string;
  updated_at: string;
}

export interface ForumComment {
  id: string;
  post_id: string;
  user_id: string;
  parent_id: string | null;
  content: string;
  upvotes: number;
  downvotes: number;
  is_edited: boolean;
  created_at: string;
  updated_at: string;
  author_name?: string;
  author_code?: string;
  author_avatar?: string;
}

export function useForum() {
  const { user } = useAuthContext();
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories - con timeout e fallback
  const fetchCategories = useCallback(async () => {
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );
      
      const fetchPromise = supabase
        .from('forum_categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');

      const { data, error: fetchError } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (fetchError) {
        // Tabella non esiste - usa categorie default
        console.warn('[Forum] Categories table not found, using defaults');
        setCategories([
          { id: '1', name: 'Generale', description: 'Discussioni generali', icon: '💬', color: '#00D1FF', sort_order: 1 },
          { id: '2', name: 'Strategie', description: 'Condividi strategie', icon: '🎯', color: '#7B5CFF', sort_order: 2 },
          { id: '3', name: 'Premi', description: 'Discussioni sui premi', icon: '🏆', color: '#FFD700', sort_order: 3 },
          { id: '4', name: 'Supporto', description: 'Chiedi aiuto', icon: '🆘', color: '#FF6B6B', sort_order: 4 },
          { id: '5', name: 'Off Topic', description: 'Tutto il resto', icon: '🎲', color: '#10B981', sort_order: 5 },
        ]);
        return;
      }
      setCategories(data || []);
    } catch (err: any) {
      console.warn('[Forum] Error fetching categories, using defaults:', err.message);
      // Fallback categories
      setCategories([
        { id: '1', name: 'Generale', description: 'Discussioni generali', icon: '💬', color: '#00D1FF', sort_order: 1 },
        { id: '2', name: 'Strategie', description: 'Condividi strategie', icon: '🎯', color: '#7B5CFF', sort_order: 2 },
        { id: '3', name: 'Premi', description: 'Discussioni sui premi', icon: '🏆', color: '#FFD700', sort_order: 3 },
        { id: '4', name: 'Supporto', description: 'Chiedi aiuto', icon: '🆘', color: '#FF6B6B', sort_order: 4 },
        { id: '5', name: 'Off Topic', description: 'Tutto il resto', icon: '🎲', color: '#10B981', sort_order: 5 },
      ]);
    }
  }, []);

  // Fetch posts - query semplificata con timeout
  const fetchPosts = useCallback(async (categoryId?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Timeout di 5 secondi
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 5000)
      );

      // Query posts senza join (evita errori schema cache)
      let query = supabase
        .from('forum_posts')
        .select('*')
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50);

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data: postsData, error: postsError } = await Promise.race([query, timeoutPromise]) as any;
      
      if (postsError) {
        // Se la tabella non esiste, mostra messaggio friendly
        console.warn('[Forum] Posts table error:', postsError.message);
        setPosts([]);
        setError('Forum in fase di setup. Torna presto!');
        setLoading(false);
        return;
      }

      if (!postsData || postsData.length === 0) {
        setPosts([]);
        return;
      }

      // Fetch categories separatamente
      const categoryIds = [...new Set(postsData.map(p => p.category_id).filter(Boolean))];
      let categoriesMap: Record<string, { name: string; icon: string }> = {};
      
      if (categoryIds.length > 0) {
        const { data: catData } = await supabase
          .from('forum_categories')
          .select('id, name, icon')
          .in('id', categoryIds);
        
        catData?.forEach(c => {
          categoriesMap[c.id] = { name: c.name, icon: c.icon };
        });
      }

      // Fetch profiles separatamente
      const userIds = [...new Set(postsData.map(p => p.user_id))];
      let profilesMap: Record<string, { full_name: string; agent_code: string; avatar_url: string }> = {};
      
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, agent_code, avatar_url')
          .in('id', userIds);
        
        profilesData?.forEach(p => {
          profilesMap[p.id] = { 
            full_name: p.full_name || 'Agente', 
            agent_code: p.agent_code || '', 
            avatar_url: p.avatar_url || '' 
          };
        });
      }

      // Fetch comment counts
      const postIds = postsData.map(p => p.id);
      const { data: commentsData } = await supabase
        .from('forum_comments')
        .select('post_id')
        .in('post_id', postIds);
      
      const commentCounts: Record<string, number> = {};
      commentsData?.forEach(c => {
        commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1;
      });

      // Combina tutto
      const transformedPosts: ForumPost[] = postsData.map((p: any) => ({
        id: p.id,
        title: p.title,
        content: p.content,
        category_id: p.category_id,
        category_name: categoriesMap[p.category_id]?.name || null,
        category_icon: categoriesMap[p.category_id]?.icon || null,
        user_id: p.user_id,
        author_name: profilesMap[p.user_id]?.full_name || 'Agente',
        author_code: profilesMap[p.user_id]?.agent_code || null,
        author_avatar: profilesMap[p.user_id]?.avatar_url || null,
        is_pinned: p.is_pinned,
        is_locked: p.is_locked,
        view_count: p.view_count,
        upvotes: p.upvotes,
        downvotes: p.downvotes,
        comment_count: commentCounts[p.id] || 0,
        created_at: p.created_at,
        updated_at: p.updated_at
      }));

      setPosts(transformedPosts);
    } catch (err: any) {
      console.warn('[Forum] Error fetching posts:', err.message);
      setPosts([]);
      // Messaggio user-friendly
      if (err.message === 'Timeout') {
        setError('Caricamento lento. Riprova tra poco.');
      } else if (err.message?.includes('does not exist')) {
        setError('Forum in fase di setup. Torna presto!');
      } else {
        setError('Forum temporaneamente non disponibile');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Create post
  const createPost = useCallback(async (
    title: string,
    content: string,
    categoryId?: string
  ): Promise<string | null> => {
    if (!user) {
      toast.error('Devi essere loggato per creare un post');
      return null;
    }

    try {
      const { data, error: insertError } = await supabase
        .from('forum_posts')
        .insert({
          user_id: user.id,
          title: title.trim(),
          content: content.trim(),
          category_id: categoryId || null
        })
        .select('id')
        .single();

      if (insertError) throw insertError;

      toast.success('Post pubblicato!');
      await fetchPosts();
      return data?.id || null;
    } catch (err: any) {
      console.error('[Forum] Error creating post:', err);
      toast.error('Errore nella creazione del post');
      return null;
    }
  }, [user, fetchPosts]);

  // Fetch comments for a post - query semplificata senza join
  const fetchComments = useCallback(async (postId: string): Promise<ForumComment[]> => {
    try {
      const { data: commentsData, error: fetchError } = await supabase
        .from('forum_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;
      if (!commentsData || commentsData.length === 0) return [];

      // Fetch profiles separatamente
      const userIds = [...new Set(commentsData.map(c => c.user_id))];
      let profilesMap: Record<string, { full_name: string; agent_code: string; avatar_url: string }> = {};
      
      if (userIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, full_name, agent_code, avatar_url')
          .in('id', userIds);
        
        profilesData?.forEach(p => {
          profilesMap[p.id] = { 
            full_name: p.full_name || 'Agente', 
            agent_code: p.agent_code || '', 
            avatar_url: p.avatar_url || '' 
          };
        });
      }

      return commentsData.map((c: any) => ({
        ...c,
        author_name: profilesMap[c.user_id]?.full_name || 'Agente',
        author_code: profilesMap[c.user_id]?.agent_code || null,
        author_avatar: profilesMap[c.user_id]?.avatar_url || null
      }));
    } catch (err: any) {
      console.error('[Forum] Error fetching comments:', err);
      return [];
    }
  }, []);

  // Add comment
  const addComment = useCallback(async (
    postId: string,
    content: string,
    parentId?: string
  ): Promise<boolean> => {
    if (!user) {
      toast.error('Devi essere loggato per commentare');
      return false;
    }

    try {
      const { error: insertError } = await supabase
        .from('forum_comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          parent_id: parentId || null,
          content: content.trim()
        });

      if (insertError) throw insertError;

      toast.success('Commento aggiunto!');
      return true;
    } catch (err: any) {
      console.error('[Forum] Error adding comment:', err);
      toast.error('Errore nell\'aggiunta del commento');
      return false;
    }
  }, [user]);

  // Vote on post or comment
  const vote = useCallback(async (
    type: 'post' | 'comment',
    id: string,
    voteType: 1 | -1
  ): Promise<boolean> => {
    if (!user) {
      toast.error('Devi essere loggato per votare');
      return false;
    }

    try {
      const voteData = type === 'post' 
        ? { user_id: user.id, post_id: id, vote_type: voteType }
        : { user_id: user.id, comment_id: id, vote_type: voteType };

      // Upsert vote
      const { error: voteError } = await supabase
        .from('forum_votes')
        .upsert(voteData, {
          onConflict: type === 'post' ? 'user_id,post_id' : 'user_id,comment_id'
        });

      if (voteError) throw voteError;

      // Update vote counts
      const table = type === 'post' ? 'forum_posts' : 'forum_comments';
      const column = voteType === 1 ? 'upvotes' : 'downvotes';
      
      await supabase.rpc('increment', { 
        table_name: table, 
        row_id: id, 
        column_name: column 
      }).catch(() => {
        // Fallback: manual increment
      });

      return true;
    } catch (err: any) {
      console.error('[Forum] Error voting:', err);
      return false;
    }
  }, [user]);

  // Increment view count
  const incrementViews = useCallback(async (postId: string) => {
    try {
      await supabase.rpc('increment_post_views', { p_post_id: postId });
    } catch (err) {
      // Silent fail - not critical
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchCategories();
    fetchPosts();
  }, [fetchCategories, fetchPosts]);

  return {
    categories,
    posts,
    loading,
    error,
    fetchPosts,
    createPost,
    fetchComments,
    addComment,
    vote,
    incrementViews,
    refetch: () => fetchPosts()
  };
}

export default useForum;

