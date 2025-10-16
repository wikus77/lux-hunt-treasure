// © 2025 Joseph MULÉ – M1SSION™ – Norah 2.0 Content Sources Manager
import { useState } from 'react';
import { FileText, Link2, Map, Upload, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { enrichDocument, deduplicateDocuments, type NorahDocument } from '@/lib/norah/enrichment';

type SourceType = 'files' | 'urls' | 'sitemap';

export default function ContentSources() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<SourceType>('files');
  const [urlList, setUrlList] = useState('');
  const [sitemapUrl, setSitemapUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<NorahDocument[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());

  // File picker handler
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setLoading(true);
    
    try {
      const docs: NorahDocument[] = [];
      
      for (const file of files) {
        const text = await file.text();
        const raw: NorahDocument = {
          title: file.name.replace(/\.(md|mdx|html|txt)$/i, ''),
          text,
          tags: [],
          source: 'kb',
          url: `file://${file.name}`,
          language: 'it',
          updatedAt: new Date().toISOString(),
        };
        
        // Enrich document (auto-tag, summary)
        const enriched = await enrichDocument(raw);
        docs.push(enriched);
      }
      
      // Deduplicate
      const deduped = deduplicateDocuments(docs);
      setCandidates(prev => [...prev, ...deduped]);
      setSelected(new Set(Array.from({ length: deduped.length }, (_, i) => candidates.length + i)));
      
      toast({
        title: '✅ Files Loaded',
        description: `${deduped.length} documents ready (${docs.length - deduped.length} duplicates removed)`,
      });
    } catch (error: any) {
      toast({ title: '❌ File Load Failed', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // URL list handler
  const handleUrlLoad = async () => {
    const urls = urlList.split('\n').filter(u => u.trim() && u.startsWith('http'));
    if (urls.length === 0) {
      toast({ title: '⚠️ No URLs', description: 'Enter valid URLs (one per line)', variant: 'destructive' });
      return;
    }
    
    setLoading(true);
    try {
      const docs: NorahDocument[] = [];
      
      for (const url of urls) {
        try {
          const response = await fetch(url);
          const html = await response.text();
          
          // Basic HTML sanitization (remove scripts, styles, extract text)
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          doc.querySelectorAll('script, style, nav, footer').forEach(el => el.remove());
          const text = doc.body.textContent?.trim() || '';
          
          if (text.length < 100) continue; // Skip empty pages
          
          const raw: NorahDocument = {
            title: doc.title || new URL(url).pathname.split('/').pop() || 'Untitled',
            text,
            tags: [],
            source: 'site',
            url,
            language: 'it',
            updatedAt: new Date().toISOString(),
          };
          
          const enriched = await enrichDocument(raw);
          docs.push(enriched);
        } catch (err) {
          console.warn(`Failed to fetch ${url}:`, err);
        }
      }
      
      const deduped = deduplicateDocuments([...candidates, ...docs]);
      setCandidates(deduped);
      setSelected(new Set(Array.from({ length: deduped.length }, (_, i) => i)));
      
      toast({
        title: '✅ URLs Loaded',
        description: `${docs.length} pages fetched from ${urls.length} URLs`,
      });
    } catch (error: any) {
      toast({ title: '❌ URL Load Failed', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // Sitemap crawler
  const handleSitemapCrawl = async () => {
    if (!sitemapUrl.trim() || !sitemapUrl.startsWith('http')) {
      toast({ title: '⚠️ Invalid Sitemap', description: 'Enter valid sitemap URL', variant: 'destructive' });
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(sitemapUrl);
      const xml = await response.text();
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(xml, 'application/xml');
      const urls = Array.from(doc.querySelectorAll('loc')).map(el => el.textContent?.trim()).filter(Boolean) as string[];
      
      if (urls.length === 0) {
        toast({ title: '⚠️ Empty Sitemap', description: 'No URLs found', variant: 'destructive' });
        return;
      }
      
      // Fetch first 50 URLs (to avoid overwhelming)
      const limitedUrls = urls.slice(0, 50);
      const docs: NorahDocument[] = [];
      
      for (const url of limitedUrls) {
        try {
          const response = await fetch(url);
          const html = await response.text();
          
          const parser = new DOMParser();
          const doc = parser.parseFromString(html, 'text/html');
          doc.querySelectorAll('script, style, nav, footer').forEach(el => el.remove());
          const text = doc.body.textContent?.trim() || '';
          
          if (text.length < 100) continue;
          
          const raw: NorahDocument = {
            title: doc.title || new URL(url).pathname.split('/').pop() || 'Untitled',
            text,
            tags: [],
            source: 'sitemap',
            url,
            language: 'it',
            updatedAt: new Date().toISOString(),
          };
          
          const enriched = await enrichDocument(raw);
          docs.push(enriched);
        } catch (err) {
          console.warn(`Failed to fetch ${url}:`, err);
        }
      }
      
      const deduped = deduplicateDocuments([...candidates, ...docs]);
      setCandidates(deduped);
      setSelected(new Set(Array.from({ length: deduped.length }, (_, i) => i)));
      
      toast({
        title: '✅ Sitemap Crawled',
        description: `${docs.length} pages from ${limitedUrls.length} URLs`,
      });
    } catch (error: any) {
      toast({ title: '❌ Sitemap Crawl Failed', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = (index: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const selectAll = () => setSelected(new Set(Array.from({ length: candidates.length }, (_, i) => i)));
  const clearAll = () => setSelected(new Set());

  const getSelectedDocs = () => candidates.filter((_, i) => selected.has(i));

  return (
    <div className="space-y-4">
      {/* Source Type Tabs */}
      <div className="flex gap-2">
        <Button
          variant={activeTab === 'files' ? 'default' : 'outline'}
          onClick={() => setActiveTab('files')}
          size="sm"
        >
          <FileText className="w-4 h-4 mr-2" />
          Files
        </Button>
        <Button
          variant={activeTab === 'urls' ? 'default' : 'outline'}
          onClick={() => setActiveTab('urls')}
          size="sm"
        >
          <Link2 className="w-4 h-4 mr-2" />
          URLs
        </Button>
        <Button
          variant={activeTab === 'sitemap' ? 'default' : 'outline'}
          onClick={() => setActiveTab('sitemap')}
          size="sm"
        >
          <Map className="w-4 h-4 mr-2" />
          Sitemap
        </Button>
      </div>

      {/* Content by Tab */}
      <Card>
        <CardHeader>
          <CardTitle className="font-orbitron">
            {activeTab === 'files' && 'File Picker'}
            {activeTab === 'urls' && 'URL List'}
            {activeTab === 'sitemap' && 'Sitemap Crawler'}
          </CardTitle>
          <CardDescription>
            {activeTab === 'files' && 'Upload Markdown, MDX, HTML, or TXT files'}
            {activeTab === 'urls' && 'Paste URLs (one per line)'}
            {activeTab === 'sitemap' && 'Enter sitemap URL (e.g., https://domain.com/sitemap.xml)'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activeTab === 'files' && (
            <div>
              <input
                type="file"
                multiple
                accept=".md,.mdx,.html,.txt"
                onChange={handleFileSelect}
                className="w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                disabled={loading}
              />
            </div>
          )}
          
          {activeTab === 'urls' && (
            <>
              <Textarea
                value={urlList}
                onChange={(e) => setUrlList(e.target.value)}
                placeholder="https://example.com/page1&#10;https://example.com/page2"
                rows={8}
                disabled={loading}
              />
              <Button onClick={handleUrlLoad} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Upload className="w-4 h-4 mr-2" />}
                Load URLs
              </Button>
            </>
          )}
          
          {activeTab === 'sitemap' && (
            <>
              <Input
                value={sitemapUrl}
                onChange={(e) => setSitemapUrl(e.target.value)}
                placeholder="https://example.com/sitemap.xml"
                disabled={loading}
              />
              <Button onClick={handleSitemapCrawl} disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Map className="w-4 h-4 mr-2" />}
                Crawl Sitemap
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Preview Candidates */}
      {candidates.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between font-orbitron">
              <span>Preview ({candidates.length} documents)</span>
              <div className="flex gap-2">
                <Button onClick={selectAll} variant="outline" size="sm">Select All</Button>
                <Button onClick={clearAll} variant="outline" size="sm">Clear All</Button>
              </div>
            </CardTitle>
            <CardDescription>
              {selected.size} selected • Auto-enriched with tags and summaries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {candidates.map((doc, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                  <Checkbox
                    checked={selected.has(idx)}
                    onCheckedChange={() => toggleSelection(idx)}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-sm truncate">{doc.title}</h4>
                      <Badge variant="secondary" className="shrink-0">{doc.source}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {doc.text.substring(0, 300)}...
                    </p>
                    <div className="flex gap-1 mt-2">
                      {doc.tags.slice(0, 5).map((tag, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
