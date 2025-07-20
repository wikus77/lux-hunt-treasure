// © 2025 Joseph MULÉ – M1SSION™ - ALL RIGHTS RESERVED - NIYVORA KFT

import React, { useState } from 'react';
import { BookOpen, Plus, Search, Calendar, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface ClueEntry {
  id: string;
  title: string;
  content: string;
  week: number;
  tags: string[];
  createdAt: Date;
  importance: 'low' | 'medium' | 'high';
}

const ClueJournal: React.FC = () => {
  const [entries, setEntries] = useState<ClueEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newEntry, setNewEntry] = useState({
    title: '',
    content: '',
    week: 1,
    tags: '',
    importance: 'medium' as const
  });

  const handleSaveEntry = () => {
    if (!newEntry.title || !newEntry.content) {
      toast.error('Titolo e contenuto sono obbligatori');
      return;
    }

    const entry: ClueEntry = {
      id: crypto.randomUUID(),
      title: newEntry.title,
      content: newEntry.content,
      week: newEntry.week,
      tags: newEntry.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      createdAt: new Date(),
      importance: newEntry.importance
    };

    setEntries([entry, ...entries]);
    setNewEntry({ title: '', content: '', week: 1, tags: '', importance: 'medium' });
    setShowAddForm(false);
    toast.success('Voce del diario salvata');
  };

  const filteredEntries = entries.filter(entry =>
    entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="h-full overflow-y-auto pb-20 space-y-8" style={{
      height: 'calc(100dvh - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px) - 80px)',
      paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 80px)'
    }}>
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-primary flex items-center justify-center shadow-xl shadow-cyan-500/20">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-foreground">Clue Journal</h3>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)} className="bg-gradient-to-r from-cyan-500 via-primary to-primary/80 hover:from-cyan-400 hover:to-primary/90 rounded-xl py-3 px-6 shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300">
          <Plus className="w-4 h-4 mr-2" />
          Nuova Voce
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="SEARCH [Cerca nel diario...]"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-muted/60 border-2 border-border/50 rounded-xl px-4 py-4 backdrop-blur-md focus:ring-2 focus:ring-cyan-400/40 focus:border-cyan-400 transition-all duration-300 text-lg"
        />
      </div>

      {/* Add New Entry Form */}
      {showAddForm && (
        <Card className="border-2 border-cyan-500/20 rounded-2xl bg-card/60 backdrop-blur-md shadow-2xl shadow-cyan-500/10">
          <CardHeader className="border-b-0">
            <CardTitle className="text-xl text-center bg-gradient-to-r from-cyan-400 to-primary bg-clip-text text-transparent">
              Nuova Voce del Diario
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Titolo</Label>
              <Input
                id="title"
                placeholder="Titolo dell'indizio..."
                value={newEntry.title}
                onChange={(e) => setNewEntry({...newEntry, title: e.target.value})}
                className="bg-muted/50 border-border rounded-lg px-4 py-3 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="week">Settimana</Label>
                <Input
                  id="week"
                  type="number"
                  min="1"
                  max="4"
                  value={newEntry.week}
                  onChange={(e) => setNewEntry({...newEntry, week: parseInt(e.target.value)})}
                  className="bg-muted/50 border-border rounded-lg px-4 py-3 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>
              <div>
                <Label htmlFor="importance">Importanza</Label>
                <select
                  id="importance"
                  value={newEntry.importance}
                  onChange={(e) => setNewEntry({...newEntry, importance: e.target.value as any})}
                  className="w-full h-10 px-3 rounded-lg bg-muted/50 border border-border text-foreground backdrop-blur-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                >
                  <option value="low">Bassa</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="tags">Tags (separati da virgole)</Label>
              <Input
                id="tags"
                placeholder="geografia, simbolo, numero..."
                value={newEntry.tags}
                onChange={(e) => setNewEntry({...newEntry, tags: e.target.value})}
                className="bg-muted/50 border-border rounded-lg px-4 py-3 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>

            <div>
              <Label htmlFor="content">Contenuto</Label>
              <Textarea
                id="content"
                placeholder="Descrizione dettagliata dell'indizio..."
                value={newEntry.content}
                onChange={(e) => setNewEntry({...newEntry, content: e.target.value})}
                className="bg-muted/50 border-border rounded-lg px-4 py-3 backdrop-blur-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                rows={4}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveEntry} className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-lg shadow-md hover:shadow-lg transition-all">
                Salva Voce
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)} className="rounded-lg">
                Annulla
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Entries List */}
      <div className="space-y-4">
        {filteredEntries.length === 0 ? (
          <Card className="border-border rounded-xl bg-card/30 backdrop-blur-sm">
            <CardContent className="py-8 text-center text-muted-foreground">
              <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
              {searchTerm ? 'Nessun risultato trovato' : 'Nessuna voce nel diario'}
            </CardContent>
          </Card>
        ) : (
          filteredEntries.map((entry) => (
            <Card key={entry.id} className="border-border rounded-xl bg-card/40 backdrop-blur-sm shadow-sm hover:shadow-md transition-all">
              <CardContent className="py-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getImportanceColor(entry.importance)}`} />
                    <h5 className="font-semibold text-foreground">{entry.title}</h5>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Settimana {entry.week}</span>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground mb-3 whitespace-pre-wrap">
                  {entry.content}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {entry.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {entry.createdAt.toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ClueJournal;