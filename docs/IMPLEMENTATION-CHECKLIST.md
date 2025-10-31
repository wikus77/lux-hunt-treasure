# ✅ Implementation Checklist — Pulse Energy + Rank System

**M1SSION™ — Full Integration Roadmap**  
**© 2025 Joseph MULÉ – ALL RIGHTS RESERVED – NIYVORA KFT™**

---

## 📦 Phase 1: Database Setup (Backend)

### Step 1.1: Create agent_ranks table
- [ ] Execute `docs/sql-migrations/20251031_001_create_agent_ranks.sql`
- [ ] Verify 11 ranks seeded (AG-01 → M1-10 + SRC-∞)
- [ ] Test query: `SELECT * FROM agent_ranks ORDER BY pe_min;`
- [ ] Verify RLS: public can SELECT, only admin can INSERT/UPDATE

### Step 1.2: Extend profiles table
- [ ] Execute `docs/sql-migrations/20251031_002_extend_profiles_with_rank.sql`
- [ ] Verify columns added: `pulse_energy`, `rank_id`, `rank_updated_at`
- [ ] Check initial sync: `SELECT id, pulse_energy, rank_id FROM profiles LIMIT 10;`
- [ ] Verify all users have `rank_id` assigned

### Step 1.3: Create rank_history table
- [ ] Execute `docs/sql-migrations/20251031_003_create_rank_history.sql`
- [ ] Test insert: Should fail (service_role only)
- [ ] Test select: Users see only their own rows

### Step 1.4: Deploy PE award functions
- [ ] Execute `docs/sql-migrations/20251031_004_create_award_pulse_energy_function.sql`
- [ ] Test `award_pulse_energy()`:
  ```sql
  SELECT award_pulse_energy(
    '<test-user-uuid>',
    100,
    'test',
    '{}'::jsonb
  );
  ```
- [ ] Verify `profiles.pulse_energy` updated
- [ ] Verify `user_xp.total_xp` synced
- [ ] Test `recompute_rank()`:
  ```sql
  SELECT recompute_rank('<test-user-uuid>');
  ```

### Step 1.5: Update triggers
- [ ] Execute `docs/sql-migrations/20251031_005_update_xp_triggers_to_pe.sql`
- [ ] Test Buzz: Insert in `buzz_activations` → +15 PE
- [ ] Test Buzz Map: Insert in `buzz_map_activations` → +10 PE
- [ ] Test Referral: Insert profile with `invited_by_code` → inviter gets +25 PE

### Step 1.6: MCP protection
- [ ] Execute `docs/sql-migrations/20251031_006_mcp_protection_trigger.sql`
- [ ] Test: Try `UPDATE profiles SET rank_id = 11 WHERE email != 'wikus77@hotmail.it';`
- [ ] Expected: Error "MCP rank is reserved"
- [ ] Test Joseph: Should allow MCP assignment

---

## 🎨 Phase 2: Frontend Integration

### Step 2.1: Verify hook (already created)
- [ ] Check `src/hooks/usePulseEnergy.ts` exists
- [ ] Test in browser console:
  ```js
  // In component using hook
  console.log(pulseEnergy, currentRank, nextRank);
  ```
- [ ] Verify `ranksAvailable` is `true` after backend migration

### Step 2.2: Verify UI components (already created)
- [ ] Check `src/components/pulse/PulseEnergyBadge.tsx`
- [ ] Check `src/components/pulse/PulseEnergyProgressBar.tsx`
- [ ] Check `src/components/pulse/RankUpModal.tsx`

### Step 2.3: Integrate in Profile page
- [ ] Uncomment placeholder in `src/components/profile/ProfileInfo.tsx`
- [ ] Add imports:
  ```tsx
  import { usePulseEnergy } from '@/hooks/usePulseEnergy';
  import PulseEnergyBadge from '@/components/pulse/PulseEnergyBadge';
  import PulseEnergyProgressBar from '@/components/pulse/PulseEnergyProgressBar';
  import RankUpModal from '@/components/pulse/RankUpModal';
  ```
- [ ] Add hook call:
  ```tsx
  const { pulseEnergy, currentRank, nextRank, progressToNextRank } = usePulseEnergy();
  ```
- [ ] Mount components in UI (see `PULSE-INTEGRATION-FRONTEND.md`)

### Step 2.4: RankUpModal logic
- [ ] Add state in Profile component:
  ```tsx
  const [showRankUp, setShowRankUp] = useState(false);
  const [newRank, setNewRank] = useState<AgentRank | null>(null);
  ```
- [ ] Add useEffect for detection:
  ```tsx
  useEffect(() => {
    const lastRankCode = localStorage.getItem('__m1_last_rank_code');
    if (currentRank && currentRank.code !== lastRankCode) {
      setNewRank(currentRank);
      setShowRankUp(true);
      localStorage.setItem('__m1_last_rank_code', currentRank.code);
    }
  }, [currentRank]);
  ```
- [ ] Mount modal:
  ```tsx
  {showRankUp && newRank && (
    <RankUpModal
      open={showRankUp}
      onClose={() => setShowRankUp(false)}
      newRank={newRank}
    />
  )}
  ```

### Step 2.5: Replace "XP" labels with "PE"
- [ ] Update `ProfileTabs.tsx` line ~113: "PE totali" instead of "Punti totali"
- [ ] Update any other visible "XP" references to "PE" or "Pulse Energy"

---

## 🧪 Phase 3: Testing

### Unit Tests
- [ ] Hook `usePulseEnergy` calculates rank correctly
- [ ] Progress bar shows correct percentage
- [ ] Badge displays correct colors/symbols

### Integration Tests (Staging)
- [ ] User at 990 PE → Recruit (AG-01)
- [ ] Award +20 PE → Rank-up to Field Agent (AG-02)
- [ ] RankUpModal appears once
- [ ] localStorage stores new rank code
- [ ] Refresh page → Modal does NOT appear again
- [ ] user_xp.total_xp matches profiles.pulse_energy

### Regression Tests
- [ ] Buzz activation still works (awards +15 PE)
- [ ] Buzz Map still works (awards +10 PE)
- [ ] Referral still works (awards +25 PE to inviter)
- [ ] `useXpSystem()` still functional in other components
- [ ] Credits consumption unchanged
- [ ] No console errors

### Security Tests
- [ ] Non-admin cannot assign MCP rank
- [ ] Users can only view their own rank_history
- [ ] Public can read agent_ranks (catalog)
- [ ] Only service_role can insert rank_history

---

## 🚀 Phase 4: Production Deployment

### Pre-Deploy Checklist
- [ ] All migrations tested on staging
- [ ] No breaking changes in existing features
- [ ] Frontend build succeeds without errors
- [ ] All tests passing (unit + integration)

### Deploy Steps
1. [ ] Deploy backend migrations (in order: 001 → 006)
2. [ ] Verify migrations applied: Check tables exist in prod
3. [ ] Regenerate Supabase types: `npx supabase gen types typescript`
4. [ ] Update `usePulseEnergy.ts` to use typed `from('agent_ranks')`
5. [ ] Deploy frontend code
6. [ ] Test live: Create test account → earn PE → verify rank-up

### Post-Deploy Monitoring
- [ ] Monitor `rank_history` inserts
- [ ] Check for errors in Supabase logs
- [ ] Verify PE awards on Buzz/Map/Referral events
- [ ] User feedback: RankUpModal experience

---

## 📊 Verification Queries

### Check rank distribution
```sql
SELECT 
  ar.name_it AS rank,
  COUNT(p.id) AS user_count
FROM profiles p
LEFT JOIN agent_ranks ar ON p.rank_id = ar.id
GROUP BY ar.name_it, ar.pe_min
ORDER BY ar.pe_min;
```

### Top 10 by PE
```sql
SELECT 
  p.full_name,
  p.agent_code,
  p.pulse_energy,
  ar.name_it AS rank
FROM profiles p
LEFT JOIN agent_ranks ar ON p.rank_id = ar.id
ORDER BY p.pulse_energy DESC
LIMIT 10;
```

### Recent rank-ups
```sql
SELECT 
  p.full_name,
  old_r.name_it AS old_rank,
  new_r.name_it AS new_rank,
  rh.delta_pe,
  rh.reason,
  rh.created_at
FROM rank_history rh
JOIN profiles p ON rh.user_id = p.id
LEFT JOIN agent_ranks old_r ON rh.old_rank_id = old_r.id
JOIN agent_ranks new_r ON rh.new_rank_id = new_r.id
ORDER BY rh.created_at DESC
LIMIT 20;
```

---

## 🐛 Troubleshooting

### Issue: Ranks not showing in UI
- Check: `agent_ranks` table populated?
  ```sql
  SELECT COUNT(*) FROM agent_ranks;
  -- Expected: 11
  ```
- Check: Hook receiving data?
  ```js
  console.log(ranksAvailable); // Should be true
  ```

### Issue: Rank not updating after PE increase
- Run: `SELECT recompute_rank('<user-uuid>');`
- Check: `rank_history` has entry?
  ```sql
  SELECT * FROM rank_history WHERE user_id = '<user-uuid>' ORDER BY created_at DESC LIMIT 1;
  ```

### Issue: MCP rank assigned to wrong user
- Check trigger: `enforce_mcp_protection` exists?
  ```sql
  SELECT * FROM pg_trigger WHERE tgname = 'enforce_mcp_protection';
  ```
- Test manually:
  ```sql
  UPDATE profiles SET rank_id = 11 WHERE email = 'test@test.com';
  -- Expected: Error
  ```

---

## 📝 Rollback Plan

If critical issues arise:

1. **Disable triggers (emergency):**
   ```sql
   ALTER TABLE buzz_activations DISABLE TRIGGER buzz_awards_pe;
   ALTER TABLE buzz_map_activations DISABLE TRIGGER buzz_map_awards_pe;
   ALTER TABLE profiles DISABLE TRIGGER referral_awards_pe;
   ```

2. **Revert to XP-only mode:**
   - Comment out PE UI components in Profile
   - Use `useXpSystem()` directly
   - Keep `award_pulse_energy()` but don't call from triggers

3. **Full rollback (last resort):**
   ```sql
   DROP TRIGGER IF EXISTS buzz_awards_pe ON buzz_activations;
   DROP TRIGGER IF EXISTS buzz_map_awards_pe ON buzz_map_activations;
   DROP TRIGGER IF EXISTS referral_awards_pe ON profiles;
   DROP TRIGGER IF EXISTS enforce_mcp_protection ON profiles;
   DROP FUNCTION IF EXISTS award_pulse_energy;
   DROP FUNCTION IF EXISTS recompute_rank;
   DROP TABLE IF EXISTS rank_history;
   ALTER TABLE profiles DROP COLUMN IF EXISTS pulse_energy, DROP COLUMN IF EXISTS rank_id, DROP COLUMN IF EXISTS rank_updated_at;
   DROP TABLE IF EXISTS agent_ranks;
   ```

---

**Status:** 🟢 Ready for Execution  
**Version:** 1.0.0  
**Last Updated:** 2025-10-31

© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
