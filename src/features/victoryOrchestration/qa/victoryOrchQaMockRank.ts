/**
 * QA harness — local rank payload for presentation-only RankUpVideoModal.
 * Not persisted; not sent to server; does not affect real user rank.
 */

import type { HierarchyLevel } from '@/config/hierarchyConfig';
import { HIERARCHY_LEVELS } from '@/config/hierarchyConfig';

/** Field Agent tier: strong color + icon; same asset paths as prod (optional video on CTA). */
export const VICTORY_ORCH_QA_MOCK_RANK: HierarchyLevel = { ...HIERARCHY_LEVELS[2] };
