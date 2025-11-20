// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { ExternalLink, Calendar, Star, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';

interface SuggestedNotification {
  id: string;
  item_id: string | null;
  reason: string;
  score: number;
  created_at: string;
  sent_at: string | null;
  external_feed_items?: {
    title: string;
    url: string;
    tags: string[];
  };
}

export const RecentSuggestionsTab: React.FC = () => {
  const [suggestions, setSuggestions] = useState<SuggestedNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const { getCurrentUser } = useUnifiedAuth();
  const currentUser = getCurrentUser();

  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchSuggestions = async () => {
      try {
        const { data, error } = await supabase
          .from('suggested_notifications')
          .select(`
            id,
            item_id,
            reason,
            score,
            created_at,
            sent_at,
            external_feed_items:item_id (
              title,
              url,
              tags
            )
          `)
          .eq('user_id', currentUser.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Error fetching suggestions:', error);
          return;
        }

        // Normalize external_feed_items from array to object
        const normalized = (data || []).map((it: any) => {
          const ext = Array.isArray(it.external_feed_items) 
            ? it.external_feed_items[0] 
            : it.external_feed_items;
          return {
            ...it,
            external_feed_items: ext
              ? { 
                  title: String(ext.title ?? ''), 
                  url: String(ext.url ?? ''), 
                  tags: Array.isArray(ext.tags) ? ext.tags.map(String) : [] 
                }
              : { title: '', url: '', tags: [] }
          };
        });

        setSuggestions(normalized as SuggestedNotification[]);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, [currentUser?.id]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-black/20 border border-cyan-500/30 rounded-lg p-4">
        <div className="animate-pulse text-cyan-300">Caricamento suggerimenti...</div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="bg-black/20 border border-cyan-500/30 rounded-lg p-4">
        <div className="text-white/60 text-center">
          <Tag className="w-8 h-8 mx-auto mb-2 text-cyan-400/50" />
          <p>Nessun suggerimento trovato</p>
          <p className="text-sm mt-1">I suggerimenti appariranno qui quando il sistema li genererà</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/20 border border-cyan-500/30 rounded-lg p-4">
      <h3 className="text-lg font-bold text-cyan-300 mb-4 flex items-center">
        <Tag className="mr-2 h-5 w-5" />
        Recent Suggested (read-only)
      </h3>
      
      <div className="space-y-3 max-h-80 overflow-y-auto">
        {suggestions.map((suggestion) => (
          <div 
            key={suggestion.id} 
            className="bg-black/30 border border-white/10 rounded-lg p-3 hover:border-cyan-500/30 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-cyan-500/20 text-cyan-300 px-2 py-1 rounded">
                    {suggestion.reason}
                  </span>
                  <div className="flex items-center text-yellow-400 text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    {suggestion.score.toFixed(2)}
                  </div>
                </div>
                
                {suggestion.external_feed_items && (
                  <h4 className="text-white font-medium text-sm mb-1">
                    {suggestion.external_feed_items.title}
                  </h4>
                )}
              </div>
              
              {suggestion.external_feed_items?.url && (
                <a
                  href={suggestion.external_feed_items.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 p-1"
                  title="Apri item"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
            
            <div className="flex items-center justify-between text-xs text-white/60">
              <div className="flex items-center">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDate(suggestion.created_at)}
              </div>
              
              <div className="flex items-center gap-2">
                <span>ID: {suggestion.id.slice(0, 8)}...</span>
                {suggestion.sent_at ? (
                  <span className="text-green-400">✓ Inviato</span>
                ) : (
                  <span className="text-yellow-400">⏳ Pending</span>
                )}
              </div>
            </div>
            
            {suggestion.external_feed_items?.tags && suggestion.external_feed_items.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {suggestion.external_feed_items.tags.slice(0, 3).map((tag, index) => (
                  <span key={index} className="text-xs bg-white/10 text-white/70 px-1 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
                {suggestion.external_feed_items.tags.length > 3 && (
                  <span className="text-xs text-white/50">+{suggestion.external_feed_items.tags.length - 3}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};