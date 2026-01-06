/**
 * M1SSION™ Forum Page
 * Community forum con posts, commenti e votazioni
 * © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, Plus, ThumbsUp, ThumbsDown, Eye, 
  Clock, User, Send, X, ChevronLeft, Pin, Lock,
  MessageCircle, Filter, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useForum, ForumPost, ForumComment } from '@/hooks/useForum';
import { useAuthContext } from '@/contexts/auth';
import { formatDistanceToNow } from 'date-fns';
import { it } from 'date-fns/locale';
import { LandingHeader } from '@/components/landing/LandingHeader';

// Post Detail View
const PostDetail: React.FC<{
  post: ForumPost;
  onBack: () => void;
}> = ({ post, onBack }) => {
  const { user } = useAuthContext();
  const { fetchComments, addComment, vote, incrementViews } = useForum();
  const [comments, setComments] = useState<ForumComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadComments = async () => {
      setLoading(true);
      incrementViews(post.id);
      const data = await fetchComments(post.id);
      setComments(data);
      setLoading(false);
    };
    loadComments();
  }, [post.id, fetchComments, incrementViews]);

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);
    const success = await addComment(post.id, newComment);
    if (success) {
      setNewComment('');
      const data = await fetchComments(post.id);
      setComments(data);
    }
    setSubmitting(false);
  };

  const handleVote = async (commentId: string, voteType: 1 | -1) => {
    await vote('comment', commentId, voteType);
    const data = await fetchComments(post.id);
    setComments(data);
  };

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -100, opacity: 0 }}
      className="space-y-4"
    >
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack} className="mb-2">
        <ChevronLeft className="w-4 h-4 mr-1" />
        Torna al Forum
      </Button>

      {/* Post Card */}
      <Card className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border-[#00D1FF]/30">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-12 h-12 border-2 border-[#00D1FF]/50">
                <AvatarImage src={post.author_avatar || undefined} />
                <AvatarFallback className="bg-gray-700">
                  {post.author_name?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-white">{post.author_name || 'Agente'}</p>
                <p className="text-xs text-gray-400 font-mono">{post.author_code}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {post.is_pinned && (
                <Badge className="bg-yellow-500/20 text-yellow-400">
                  <Pin className="w-3 h-3 mr-1" />
                  Pinnato
                </Badge>
              )}
              {post.is_locked && (
                <Badge className="bg-red-500/20 text-red-400">
                  <Lock className="w-3 h-3 mr-1" />
                  Chiuso
                </Badge>
              )}
            </div>
          </div>
          <CardTitle className="text-xl text-white mt-3">{post.title}</CardTitle>
          {post.category_name && (
            <Badge variant="outline" className="w-fit">
              {post.category_icon} {post.category_name}
            </Badge>
          )}
        </CardHeader>
        <CardContent>
          <div className="prose prose-invert max-w-none">
            <p className="text-gray-300 whitespace-pre-wrap">{post.content}</p>
          </div>
          
          <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-700/50 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {post.view_count}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              {comments.length}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: it })}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card className="bg-gray-900/50 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-[#00D1FF]" />
            Commenti ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* New Comment Input */}
          {user && !post.is_locked && (
            <div className="flex gap-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Scrivi un commento..."
                className="bg-gray-800/50 border-gray-600 min-h-[80px]"
              />
              <Button
                onClick={handleSubmitComment}
                disabled={!newComment.trim() || submitting}
                className="bg-[#00D1FF] text-black hover:bg-[#00D1FF]/80"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* Comments List */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 border-2 border-[#00D1FF] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nessun commento ancora. Sii il primo!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-800/30 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.author_avatar || undefined} />
                      <AvatarFallback className="bg-gray-700 text-sm">
                        {comment.author_name?.charAt(0) || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-white text-sm">
                          {comment.author_name || 'Agente'}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">
                          {comment.author_code}
                        </span>
                        <span className="text-xs text-gray-500">
                          • {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: it })}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">{comment.content}</p>
                      
                      {/* Vote buttons */}
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleVote(comment.id, 1)}
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-green-400 transition-colors"
                        >
                          <ThumbsUp className="w-3 h-3" />
                          {comment.upvotes}
                        </button>
                        <button
                          onClick={() => handleVote(comment.id, -1)}
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <ThumbsDown className="w-3 h-3" />
                          {comment.downvotes}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Main Forum Page
export const ForumPage: React.FC = () => {
  const { user } = useAuthContext();
  const { categories, posts, loading, error, fetchPosts, createPost, vote, refetch } = useForum();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPost, setSelectedPost] = useState<ForumPost | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<string>('');
  const [creating, setCreating] = useState(false);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    fetchPosts(categoryId === 'all' ? undefined : categoryId);
  };

  const handleCreatePost = async () => {
    if (!newPostTitle.trim() || !newPostContent.trim()) return;
    
    setCreating(true);
    const postId = await createPost(
      newPostTitle,
      newPostContent,
      newPostCategory || undefined
    );
    
    if (postId) {
      setShowCreateDialog(false);
      setNewPostTitle('');
      setNewPostContent('');
      setNewPostCategory('');
    }
    setCreating(false);
  };

  const handlePostVote = async (postId: string, voteType: 1 | -1) => {
    await vote('post', postId, voteType);
    refetch();
  };

  // 🔐 Se l'utente è loggato, non mostrare LandingHeader (sarà dentro GlobalLayout)
  const isLoggedIn = !!user;

  // If viewing a post detail
  if (selectedPost) {
    return (
      <div className={`${isLoggedIn ? 'min-h-screen' : 'fixed inset-0 z-50'} bg-black text-white overflow-y-auto`}>
        {!isLoggedIn && <LandingHeader />}
        <div 
          className={`w-full max-w-4xl mx-auto px-3 sm:px-4 ${isLoggedIn ? 'pt-4' : 'pt-20 sm:pt-24'} min-h-screen`}
          style={{
            paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
            background: 'linear-gradient(to bottom, #000000 0%, #0a0a0a 100%)',
          }}
        >
          <PostDetail post={selectedPost} onBack={() => setSelectedPost(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className={`${isLoggedIn ? 'min-h-screen' : 'fixed inset-0 z-50'} bg-black text-white overflow-y-auto`}>
      {!isLoggedIn && <LandingHeader />}
      <div 
        className={`w-full max-w-4xl mx-auto px-3 sm:px-4 ${isLoggedIn ? 'pt-4' : 'pt-20 sm:pt-24'} space-y-4 min-h-screen`}
        style={{
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)',
          background: 'linear-gradient(to bottom, #000000 0%, #0a0a0a 100%)',
        }}
      >
      {/* Header - Responsive */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center space-y-2 px-2"
      >
        <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-[#00D1FF] drop-shadow-[0_0_10px_rgba(0,209,255,0.6)]" />
          </motion.div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-orbitron font-bold text-white">
            <span className="text-[#00D1FF]">M1</span>SSION Forum
          </h1>
        </div>
        <p className="text-gray-400 text-xs sm:text-sm">
          Discuti con la community degli agenti
        </p>
      </motion.div>

      {/* Actions Bar - Responsive */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center sm:justify-between"
      >
        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-[180px] bg-gray-800/50 border-gray-600">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutte le categorie</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          
          {user ? (
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-[#00D1FF] to-[#7B5CFF] text-black hover:opacity-90 text-sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Nuovo Post
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-900 border-gray-700 max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-white">Crea nuovo post</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Titolo</label>
                    <Input
                      value={newPostTitle}
                      onChange={(e) => setNewPostTitle(e.target.value)}
                      placeholder="Titolo del post..."
                      className="bg-gray-800 border-gray-600"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Categoria</label>
                    <Select value={newPostCategory} onValueChange={setNewPostCategory}>
                      <SelectTrigger className="bg-gray-800 border-gray-600">
                        <SelectValue placeholder="Seleziona categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1 block">Contenuto</label>
                    <Textarea
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="Scrivi il tuo post..."
                      className="bg-gray-800 border-gray-600 min-h-[150px]"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Annulla
                    </Button>
                    <Button
                      onClick={handleCreatePost}
                      disabled={!newPostTitle.trim() || !newPostContent.trim() || creating}
                      className="bg-[#00D1FF] text-black hover:bg-[#00D1FF]/80"
                    >
                      {creating ? 'Pubblicando...' : 'Pubblica'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          ) : (
            <Button 
              onClick={() => window.location.href = '/login'}
              className="bg-gradient-to-r from-[#00D1FF] to-[#7B5CFF] text-black hover:opacity-90 text-sm"
            >
              <Plus className="w-4 h-4 mr-1" />
              Accedi per postare
            </Button>
          )}
        </div>
      </motion.div>

      {/* Posts List */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="space-y-3"
      >
        {loading && posts.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-2 border-[#00D1FF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <Card className="bg-red-900/20 border-red-500/30">
            <CardContent className="py-8 text-center">
              <p className="text-red-400">{error}</p>
              <Button onClick={refetch} variant="outline" className="mt-4">
                Riprova
              </Button>
            </CardContent>
          </Card>
        ) : posts.length === 0 ? (
          <Card className="bg-gray-900/50 border-gray-700/50">
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-600" />
              <p className="text-gray-400">Nessun post trovato</p>
              {user ? (
                <Button 
                  onClick={() => setShowCreateDialog(true)}
                  className="mt-4 bg-gradient-to-r from-[#00D1FF] to-[#7B5CFF] text-black"
                >
                  Crea il primo post
                </Button>
              ) : (
                <Button 
                  onClick={() => window.location.href = '/login'}
                  className="mt-4 bg-gradient-to-r from-[#00D1FF] to-[#7B5CFF] text-black"
                >
                  Accedi per postare
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence>
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 20, opacity: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card 
                  className={`bg-gray-900/50 border-gray-700/50 hover:border-[#00D1FF]/30 transition-all cursor-pointer ${
                    post.is_pinned ? 'border-yellow-500/30 bg-yellow-900/10' : ''
                  }`}
                  onClick={() => setSelectedPost(post)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {/* Author Avatar */}
                      <Avatar className="w-10 h-10 flex-shrink-0">
                        <AvatarImage src={post.author_avatar || undefined} />
                        <AvatarFallback className="bg-gray-700">
                          {post.author_name?.charAt(0) || 'A'}
                        </AvatarFallback>
                      </Avatar>

                      {/* Post Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          {post.is_pinned && (
                            <Pin className="w-4 h-4 text-yellow-400" />
                          )}
                          {post.is_locked && (
                            <Lock className="w-4 h-4 text-red-400" />
                          )}
                          <h3 className="font-semibold text-white truncate">
                            {post.title}
                          </h3>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                          <span>{post.author_name || 'Agente'}</span>
                          <span>•</span>
                          <span>{formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: it })}</span>
                          {post.category_name && (
                            <>
                              <span>•</span>
                              <Badge variant="outline" className="text-[10px] py-0">
                                {post.category_icon} {post.category_name}
                              </Badge>
                            </>
                          )}
                        </div>

                        <p className="text-gray-400 text-sm line-clamp-2">
                          {post.content}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                          <button
                            onClick={(e) => { e.stopPropagation(); handlePostVote(post.id, 1); }}
                            className="flex items-center gap-1 hover:text-green-400 transition-colors"
                          >
                            <ThumbsUp className="w-3 h-3" />
                            {post.upvotes}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handlePostVote(post.id, -1); }}
                            className="flex items-center gap-1 hover:text-red-400 transition-colors"
                          >
                            <ThumbsDown className="w-3 h-3" />
                            {post.downvotes}
                          </button>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {post.comment_count}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {post.view_count}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </motion.div>

      {/* Footer Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="text-center py-4"
      >
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <MessageSquare className="w-4 h-4" />
          {posts.length} post • {categories.length} categorie
        </div>
      </motion.div>
      </div>
    </div>
  );
};

export default ForumPage;

