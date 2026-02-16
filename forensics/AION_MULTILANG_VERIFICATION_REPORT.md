# AION / INTELLIGENCE — Multilang Verification Report

**Date:** 2026-02-16  
**Branch:** fix/aion-multilang-it-en-fr  
**Status:** VERIFICATION COMPLETE

---

## 1) FILE COINVOLTI

| File | Ruolo |
|------|-------|
| `src/pages/intel/IntelChatPanel.tsx` | UI input + send handler, chiama norah-chat-v2 |
| `supabase/functions/norah-chat-v2/index.ts` | Edge function AION (Gemini + fallback IT hardcoded) |

---

## 2) FLUSSO PAYLOAD

**IntelChatPanel sendMessage** (linee 204–215):

```ts
const { data, error } = await supabase.functions.invoke('norah-chat-v2', {
  body: {
    session_id: sessionIdRef.current,
    text: messageText,
    messages: messages.filter(...).slice(-10),
    system: 'AION_CLIENT',
    is_retry: isRetry,
    retry_attempt: currentRetry
  }
});
```

**Nessun campo `language`, `locale`, `reply_lang`, `i18n`, `accept-language`.**

---

## 3) ROOT CAUSE

**norah-chat-v2** (supabase/functions/norah-chat-v2/index.ts):

- **AION_SYSTEM_PROMPT** (linee 12–134):
  - "Rispondi in italiano fluente e chiaro" (linea 115)
  - "RISPONDI SEMPRE IN ITALIANO." (linea 134)
- **Fallback** (linee 320–360): tutte le risposte sono hardcoded in IT
- **Gemini** riceve `systemInstruction` con prompt sempre IT

---

## 4) i18next

- `IntelChatPanel` usa `useTranslation()` per UI (placeholder, errori, ecc.)
- **i18n.language NON viene passata** al backend
- Nessun override esplicito di "it" nel payload

---

## 5) PIANO PATCH

1. **Client**: `detectLang(text)` → `'it'|'en'|'fr'|null`
2. **Client**: aggiungere `lang` e `reply_lang` al payload
3. **Client**: `lastUserLang` in React state per la sessione
4. **Server**: leggere `lang`/`reply_lang`, usare prompt dinamico per lingua
5. **Server**: fallback per lingua (EN/FR) o appendere "REPLY ONLY IN &lt;lang&gt;"

---

© 2025 Joseph MULÉ – M1SSION™ – NIYVORA KFT™
