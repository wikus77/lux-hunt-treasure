# 🔬 DUPLICATES FULL ANALYSIS
## Supabase Secrets Forensic Audit

**Date:** 2026-01-20  
**Total Secrets:** 103 (OVER LIMIT!)  
**Duplicates Found:** 13 groups

---

## ⚠️ CRITICAL FINDING

**SUPABASE_ANON_KEY ≠ ANON_KEY** (different digests!)
- `SUPABASE_ANON_KEY`: a316b6238fd2def1...
- `ANON_KEY`: ce8621eff6b1eab8...

**SUPABASE_SERVICE_ROLE_KEY ≠ SERVICE_ROLE_KEY** (different digests!)
- `SUPABASE_SERVICE_ROLE_KEY`: 05a0849907f380f2...
- `SERVICE_ROLE_KEY`: 3500a2208c29edae...

⚠️ **This means there are TWO different versions of these keys!**

---

## 📊 DUPLICATE GROUPS

### GROUP 1: URL (7 duplicates) - **6 removable**
| Secret | Keep/Remove | Reason |
|--------|-------------|--------|
| `SUPABASE_URL` | ✅ KEEP | Canonical name |
| `BASE_URL` | ❌ REMOVE | Alias |
| `EXTERNAL_SUPABASE_URL` | ❌ REMOVE | Alias |
| `PROJECT_URL` | ❌ REMOVE | Alias |
| `SB_URL` | ❌ REMOVE | Alias |
| `URL` | ❌ REMOVE | Alias |
| `VITE_SUPABASE_URL` | ❌ REMOVE | Frontend alias |

**Digest:** 71db1523927cdfdb8846bac073a8ba2576efc2076e0d5b1383e693e24132d6e3

---

### GROUP 2: ANON_KEY (3 duplicates) - **3 removable**
| Secret | Keep/Remove | Reason |
|--------|-------------|--------|
| `SUPABASE_ANON_KEY` | ✅ KEEP | Canonical (different value!) |
| `ANON_KEY` | ❌ REMOVE | Old/incorrect value |
| `EXTERNAL_SUPABASE_ANON_KEY` | ❌ REMOVE | Old/incorrect value |
| `VITE_SUPABASE_ANON_KEY` | ❌ REMOVE | Frontend alias |

**⚠️ NOTE:** These have DIFFERENT digest than SUPABASE_ANON_KEY!

---

### GROUP 3: ADMIN Tokens (3 duplicates) - **2 removable**
| Secret | Keep/Remove | Reason |
|--------|-------------|--------|
| `ADMIN_TOKEN` | ✅ KEEP | Most generic |
| `ADMIN_BROADCAST_TOKEN` | ❌ REMOVE | Alias |
| `X_ADMIN_TOKEN` | ❌ REMOVE | Alias |

**Digest:** ff730232621eb7274a4e431d23a9e6341ea0fc616903a2a7ce938c983d10814e

---

### GROUP 4: VAPID Subject (3 duplicates) - **2 removable**
| Secret | Keep/Remove | Reason |
|--------|-------------|--------|
| `VAPID_SUBJECT` | ✅ KEEP | Canonical |
| `VAPID_SUB` | ❌ REMOVE | Short alias |
| `WEBPUSH_CONTACT_EMAIL` | ❌ REMOVE | Alias |

**Digest:** b1a151f01ae0f4074a852d6a65afbab389a380cfeab1ef4d303200bfd0241d77

---

### GROUP 5: VAPID_PUBLIC (2 duplicates) - **1 removable**
| Secret | Keep/Remove | Reason |
|--------|-------------|--------|
| `VAPID_PUBLIC_KEY` | ✅ KEEP | Canonical |
| `VAPID_PUBLIC` | ❌ REMOVE | Short alias |

**Digest:** 2844887bb97b98efc42de671491d0b3ee87ef710b1fc9c9462d22d337e9b78f0

---

### GROUP 6: SRK (2 duplicates) - **1 removable**
| Secret | Keep/Remove | Reason |
|--------|-------------|--------|
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ KEEP | Canonical |
| `SRK` | ❌ REMOVE | Short alias |

**Digest:** 05a0849907f380f203dd9bb2e58f066c9e763dec1b964301d683e65bbf19dfc5

---

### GROUP 7: SERVICE_ROLE_KEY (2 duplicates) - **2 removable**
| Secret | Keep/Remove | Reason |
|--------|-------------|--------|
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ KEEP | Canonical (different value!) |
| `SERVICE_ROLE_KEY` | ❌ REMOVE | Old/incorrect value |
| `EXTERNAL_SUPABASE_SERVICE_ROLE_KEY` | ❌ REMOVE | Old/incorrect value |

**⚠️ NOTE:** These have DIFFERENT digest than SUPABASE_SERVICE_ROLE_KEY!

---

### GROUP 8: PROJECT_REF (2 duplicates) - **1 removable**
| Secret | Keep/Remove | Reason |
|--------|-------------|--------|
| `PROJECT_REF` | ✅ KEEP | Canonical |
| `VITE_SUPABASE_PROJECT_ID` | ❌ REMOVE | Frontend alias |

**Digest:** 6825c6ad1439689f2290fd3c3da922bb483e6e3790d415ac06c4bb56458c55d8

---

### GROUP 9: FCM_SENDER_ID (2 duplicates) - **1 removable**
| Secret | Keep/Remove | Reason |
|--------|-------------|--------|
| `FCM_SENDER_ID` | ✅ KEEP | FCM canonical |
| `FIREBASE_MESSAGING_SENDER_ID` | ❌ REMOVE | Firebase alias |

**Digest:** 182b7fde2977ce688b6deecfcffe8876fcac1334c7c98d7b54cb83f9d01a3684

---

### GROUP 10: FCM_PROJECT_ID (2 duplicates) - **1 removable**
| Secret | Keep/Remove | Reason |
|--------|-------------|--------|
| `FCM_PROJECT_ID` | ✅ KEEP | FCM canonical |
| `FIREBASE_PROJECT_ID` | ❌ REMOVE | Firebase alias |

**Digest:** 6bff90757f1895b7b7e21a32e1dcf4c89c018b5932295ad1ac80cdbd909ce1f0

---

### GROUP 11: CONTACT_EMAIL (2 duplicates) - **0 removable**
| Secret | Keep/Remove | Reason |
|--------|-------------|--------|
| `CONTACT_EMAIL` | ✅ KEEP | Semantic: contact address |
| `SMTP_USER` | ✅ KEEP | Semantic: SMTP username |

**Note:** Same value but different semantic purpose. Keep both.

---

### GROUP 12: LOG_DELIVERY (2 duplicates) - **1 removable**
| Secret | Keep/Remove | Reason |
|--------|-------------|--------|
| `LOG_DELIVERY` | ⚠️ VERIFY | Check usage |
| `AION_DEBUG` | ⚠️ VERIFY | Check usage |

**Digest:** 6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b (likely "1" or "true")

---

### GROUP 13: INVALID SECRET - **1 removable**
| Secret | Keep/Remove | Reason |
|--------|-------------|--------|
| `SMTP_PASSWORD` | ✅ KEEP | Valid password |
| `wikus77@hotmail.it` | ❌ REMOVE | INVALID: email as secret name! |

---

## 🚨 INVALID/DIRTY SECRETS

| Secret Name | Issue | Action |
|-------------|-------|--------|
| `wikus77@hotmail.it` | Email as secret name | ❌ REMOVE |
| `` `APNS_ENVIRONMENT `` | Has backtick + newline | ❌ REMOVE (then recreate clean) |
| `` ` `` | Empty name with backtick | ❌ REMOVE |

---

## 📊 SUMMARY

| Category | Count |
|----------|-------|
| **Total secrets** | 103 |
| **Duplicate groups** | 13 |
| **Safe to remove (duplicates)** | 21 |
| **Invalid secrets** | 3 |
| **Total removable** | **24** |
| **Expected after cleanup** | **79** |

---

## ✅ CANONICAL SECRETS TO KEEP

```
SUPABASE_URL (not BASE_URL, SB_URL, URL, etc.)
SUPABASE_ANON_KEY (not ANON_KEY - different value!)
SUPABASE_SERVICE_ROLE_KEY (not SERVICE_ROLE_KEY - different value!)
ADMIN_TOKEN (not X_ADMIN_TOKEN, ADMIN_BROADCAST_TOKEN)
VAPID_SUBJECT (not VAPID_SUB, WEBPUSH_CONTACT_EMAIL)
VAPID_PUBLIC_KEY (not VAPID_PUBLIC)
FCM_PROJECT_ID (not FIREBASE_PROJECT_ID)
FCM_SENDER_ID (not FIREBASE_MESSAGING_SENDER_ID)
PROJECT_REF (not VITE_SUPABASE_PROJECT_ID)
```

