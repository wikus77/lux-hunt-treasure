// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™

import { z } from "zod";

export const NotificationPayloadSchema = z.object({
  type: z.enum(["buzz", "system", "reward", "map"]),
  title: z.string(),
  body: z.string().optional(),
  meta: z.record(z.any()).optional()
});

export type NotificationPayload = z.infer<typeof NotificationPayloadSchema>;

export interface Notification {
  id: string;
  user_id: string;
  created_at: string;
  archived_at: string | null;
  is_read: boolean;
  read_at: string | null;
  title: string | null;
  message: string;
  type: string | null;
}

export interface NotificationPreferences {
  buzz: boolean;
  system: boolean;
  reward: boolean;
  map: boolean;
}

// © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
