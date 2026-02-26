# PHASE 1 — Verifica colonna token in email_send_config

Eseguire in **Supabase SQL Editor** (progetto produzione).

---

## 1) Elenca colonne reali

```sql
SELECT column_name, data_type, ordinal_position
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'email_send_config'
ORDER BY ordinal_position;
```

**Cosa controllare:** Se compare `auth_token_st` e non `auth_token`, allora le function che fanno `SELECT auth_token` stanno leggendo NULL → 401 "Missing authorization header".

---

## 2) Leggi riga default (senza segreti in chiaro)

```sql
SELECT id, base_url,
  CASE WHEN auth_token IS NOT NULL AND trim(auth_token) <> '' THEN 'SET' ELSE 'NULL' END AS auth_token_status
FROM public.email_send_config WHERE id = 'default';
```

Se la tabella ha **solo** `auth_token_st` (e non `auth_token`), la query sopra fallisce. Allora usare:

```sql
SELECT id, base_url,
  CASE WHEN auth_token_st IS NOT NULL AND trim(auth_token_st) <> '' THEN 'SET' ELSE 'NULL' END AS auth_token_st_status
FROM public.email_send_config WHERE id = 'default';
```

---

## Conferma per PHASE 2

- **Nome colonna "token" effettiva:** _________________ (es. `auth_token` oppure `auth_token_st`).
- **Stato:** NULL / SET (senza mostrare il valore).

La migration di fix legge **solo `auth_token_st`**. Se in DB hai solo `auth_token`, la migration aggiunge la colonna `auth_token_st` e copia il valore da `auth_token`. In produzione assicurati che il token sia valorizzato in `auth_token_st` (o esegui la migration che fa la sync).
