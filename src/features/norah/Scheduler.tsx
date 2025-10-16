// © 2025 Joseph MULÉ – M1SSION™ – Content Refresh Scheduler
import { useState, useEffect } from 'react';
import { Clock, Play, Pause, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { norahIngest, norahEmbed } from '@/lib/norah/api';

interface SchedulerProps {
  onTrigger?: (job: string) => void;
}

export default function Scheduler({ onTrigger }: SchedulerProps) {
  const { toast } = useToast();
  const [enabled, setEnabled] = useState(false);
  const [lastRun, setLastRun] = useState<Record<string, string>>({});
  const [nextRun, setNextRun] = useState<Record<string, string>>({});

  // Calculate next run times (06:00 UTC for crawl, 07:00 UTC for embed)
  const calculateNextRun = () => {
    const now = new Date();
    const crawlTime = new Date(now);
    crawlTime.setUTCHours(6, 0, 0, 0);
    if (crawlTime < now) crawlTime.setUTCDate(crawlTime.getUTCDate() + 1);
    
    const embedTime = new Date(now);
    embedTime.setUTCHours(7, 0, 0, 0);
    if (embedTime < now) embedTime.setUTCDate(embedTime.getUTCDate() + 1);
    
    setNextRun({
      crawl: crawlTime.toISOString(),
      embed: embedTime.toISOString(),
    });
  };

  useEffect(() => {
    calculateNextRun();
    const interval = setInterval(calculateNextRun, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    
    const checkSchedule = async () => {
      const now = new Date();
      
      // Check if it's time to run daily crawl (06:00 UTC)
      if (now.getUTCHours() === 6 && now.getUTCMinutes() === 0) {
        const lastCrawl = lastRun.crawl;
        const today = now.toISOString().split('T')[0];
        if (!lastCrawl || !lastCrawl.startsWith(today)) {
          await runDailyCrawl();
        }
      }
      
      // Check if it's time to run embed (07:00 UTC)
      if (now.getUTCHours() === 7 && now.getUTCMinutes() === 0) {
        const lastEmbed = lastRun.embed;
        const today = now.toISOString().split('T')[0];
        if (!lastEmbed || !lastEmbed.startsWith(today)) {
          await runEmbedScheduler();
        }
      }
    };
    
    const interval = setInterval(checkSchedule, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [enabled, lastRun]);

  const runDailyCrawl = async () => {
    try {
      toast({ title: '⏰ Daily Crawl Started', description: 'Fetching new/updated content...' });
      
      // For demo: just trigger a small ingest (in production, this would fetch from sources)
      const demoDoc = {
        title: `Daily Update ${new Date().toISOString().split('T')[0]}`,
        text: 'Automated daily content refresh',
        tags: ['daily', 'auto'],
        source: 'sitemap' as const,
        url: 'auto://daily-crawl',
        language: 'it' as const,
        updatedAt: new Date().toISOString(),
      };
      
      await norahIngest({ documents: [demoDoc], dryRun: false });
      
      setLastRun(prev => ({ ...prev, crawl: new Date().toISOString() }));
      toast({ title: '✅ Daily Crawl Complete', description: 'Content updated' });
      onTrigger?.('crawl');
    } catch (error: any) {
      toast({ title: '❌ Daily Crawl Failed', description: error.message, variant: 'destructive' });
    }
  };

  const runEmbedScheduler = async () => {
    try {
      toast({ title: '⏰ Embed Scheduler Started', description: 'Processing embedding queue...' });
      
      let totalEmbedded = 0;
      let remaining = 1;
      
      while (remaining > 0) {
        const result = await norahEmbed({ reembed: false, batch: 200 });
        totalEmbedded += result.embedded || 0;
        remaining = result.remaining || 0;
      }
      
      setLastRun(prev => ({ ...prev, embed: new Date().toISOString() }));
      toast({ title: '✅ Embed Scheduler Complete', description: `Embedded ${totalEmbedded} chunks` });
      onTrigger?.('embed');
    } catch (error: any) {
      toast({ title: '❌ Embed Scheduler Failed', description: error.message, variant: 'destructive' });
    }
  };

  const formatTime = (iso: string) => {
    if (!iso) return 'Never';
    const date = new Date(iso);
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours < 0) return 'Overdue';
    return `${hours}h ${minutes}m`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between font-orbitron">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Content Refresh Scheduler
          </div>
          <Button
            onClick={() => setEnabled(!enabled)}
            variant={enabled ? 'default' : 'outline'}
            size="sm"
          >
            {enabled ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
            {enabled ? 'Enabled' : 'Disabled'}
          </Button>
        </CardTitle>
        <CardDescription>
          Automated daily crawl (06:00 UTC) and embedding (07:00 UTC)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
          <span className="text-sm font-semibold">Status:</span>
          <Badge variant={enabled ? 'default' : 'secondary'}>
            {enabled ? '✅ Active' : '⏸️ Paused'}
          </Badge>
        </div>

        {/* Jobs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="text-sm font-semibold">Daily Crawl (06:00 UTC)</p>
              <p className="text-xs text-muted-foreground">
                Last: {lastRun.crawl ? new Date(lastRun.crawl).toLocaleString() : 'Never'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Next in:</p>
              <p className="text-sm font-semibold">{formatTime(nextRun.crawl || '')}</p>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="text-sm font-semibold">Embed Scheduler (07:00 UTC)</p>
              <p className="text-xs text-muted-foreground">
                Last: {lastRun.embed ? new Date(lastRun.embed).toLocaleString() : 'Never'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Next in:</p>
              <p className="text-sm font-semibold">{formatTime(nextRun.embed || '')}</p>
            </div>
          </div>
        </div>

        {/* Manual Triggers */}
        <div className="flex gap-2">
          <Button onClick={runDailyCrawl} variant="outline" size="sm" className="flex-1">
            <RefreshCw className="w-4 h-4 mr-2" />
            Trigger Crawl Now
          </Button>
          <Button onClick={runEmbedScheduler} variant="outline" size="sm" className="flex-1">
            <RefreshCw className="w-4 h-4 mr-2" />
            Trigger Embed Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
