import React from 'react';
import { Button } from '@/components/ui/button';
import { enablePush } from '@/features/notifications/enablePush';

export default function ActivateTab() {
  const [pending, setPending] = React.useState(false);

  const onClick = async () => {
    setPending(true);
    try {
      await enablePush(); // internamente usa il loader canonico
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button onClick={onClick} disabled={pending}>
        {pending ? 'Enabling…' : 'Enable Push'}
      </Button>
    </div>
  );
}
