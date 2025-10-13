import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function M1ssionPushTest() {
  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>M1SSION™ Push Test (Placeholder)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Pagina placeholder per sbloccare la build. Usa il Push Center per i test completi.
          </p>
          <Badge variant="secondary">Ready</Badge>
        </CardContent>
      </Card>

      <Button
        onClick={() => {
          try { Notification?.requestPermission?.(); } catch {}
        }}
      >
        Request Notification Permission
      </Button>
    </div>
  );
}
