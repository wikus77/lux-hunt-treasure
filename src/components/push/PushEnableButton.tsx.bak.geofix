import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { enablePush } from '@/features/notifications/enablePush';

/** Guard-safe: nessun riferimento a VAPID o helper; delega al feature layer */
export function PushEnableButton() {
  const [pending, setPending] = useState(false);

  const onClick = async () => {
    setPending(true);
    try {
      await enablePush();
    } finally {
      setPending(false);
    }
  };

  return (
    <Button disabled={pending} onClick={onClick}>
      {pending ? 'Enabling…' : 'Enable Push'}
    </Button>
  );
}

export default PushEnableButton;
