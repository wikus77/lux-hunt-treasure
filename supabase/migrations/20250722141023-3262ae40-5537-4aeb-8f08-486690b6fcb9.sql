-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Insert sample legal documents for testing

-- Insert Terms of Service
INSERT INTO public.legal_documents (type, title, version, content_md, is_active, published_at)
VALUES (
  'terms_of_service',
  'Termini e Condizioni M1SSION™',
  '1.0',
  '# Termini e Condizioni M1SSION™

## 1. Oggetto
L''app M1SSION è un''esperienza interattiva basata su missioni, enigmi e premi reali.

## 2. Requisiti
L''uso è consentito solo agli utenti maggiorenni o con il consenso dei genitori.

## 3. Responsabilità dell''utente
L''utente si impegna a non utilizzare l''app per scopi illeciti o fraudolenti.

## 4. Proprietà Intellettuale
Tutti i contenuti, loghi, meccaniche di gioco e layout sono protetti da copyright.

## 5. Modifiche ai Termini
Ci riserviamo il diritto di modificare i presenti termini. Le modifiche saranno comunicate via app o email.

## 6. Clausola legale aggiuntiva
È vietata ogni riproduzione, copia, distribuzione o rielaborazione, anche parziale, dell''applicazione, del concept di gioco, del regolamento, delle missioni, dell''interfaccia utente o della narrativa di M1SSION. Ogni infrazione sarà perseguita legalmente ai sensi della normativa sulla proprietà intellettuale (art. 2575 c.c. e Direttiva UE 2001/29/CE).

*Ultimo aggiornamento: Gennaio 2025*',
  true,
  now()
) ON CONFLICT (type) DO UPDATE SET
  title = EXCLUDED.title,
  content_md = EXCLUDED.content_md,
  version = EXCLUDED.version,
  published_at = EXCLUDED.published_at;

-- Insert Privacy Policy
INSERT INTO public.legal_documents (type, title, version, content_md, is_active, published_at)
VALUES (
  'privacy_policy',
  'Privacy Policy M1SSION™',
  '1.0',
  '# Privacy Policy M1SSION™

La presente informativa descrive le modalità con cui M1SSION raccoglie, utilizza e protegge i dati personali degli utenti, in conformità al Regolamento UE 2016/679 (GDPR).

## 1. Titolare del trattamento
Il titolare del trattamento è NIYVORA KFT™, con sede legale registrata.

## 2. Dati trattati
Raccogliamo dati personali come:
- Nome e email
- Posizione geografica (se autorizzata)
- Dati di navigazione e contenuti generati dall''utente
- Informazioni di gioco e progressi

## 3. Finalità del trattamento
- Fornitura dei servizi dell''app
- Analisi e miglioramento dell''esperienza utente
- Comunicazioni relative a missioni e premi
- Adempimenti legali

## 4. Conservazione dei dati
I dati sono conservati per il tempo necessario al raggiungimento delle finalità indicate, salvo obblighi legali.

## 5. Diritti dell''utente
Hai diritto di accesso, rettifica, cancellazione, limitazione, portabilità e opposizione al trattamento.
Per esercitarli contattaci tramite l''app.

## 6. Cookie e strumenti di tracciamento
Consulta la nostra Cookie Policy per maggiori informazioni sui cookie utilizzati.

*Ultimo aggiornamento: Gennaio 2025*',
  true,
  now()
) ON CONFLICT (type) DO UPDATE SET
  title = EXCLUDED.title,
  content_md = EXCLUDED.content_md,
  version = EXCLUDED.version,
  published_at = EXCLUDED.published_at;

-- Insert Cookie Policy
INSERT INTO public.legal_documents (type, title, version, content_md, is_active, published_at)
VALUES (
  'cookie_policy',
  'Cookie Policy M1SSION™',
  '1.0',
  '# Cookie Policy M1SSION™

## Cosa sono i Cookie
I cookie sono piccoli file di testo memorizzati sul tuo dispositivo quando utilizzi la nostra app. Ci aiutano a fornire una migliore esperienza utente e a capire come viene utilizzata l''applicazione.

## Tipi di Cookie utilizzati

### 🔒 Cookie Essenziali
Necessari per il funzionamento base dell''app. Include autenticazione, sicurezza e funzionalità core. Non possono essere disabilitati.

### 📊 Cookie Analitici
Ci aiutano a capire come utilizzi l''app per migliorare l''esperienza utente. Include analisi dell''utilizzo e performance.

### 📢 Cookie di Marketing
Utilizzati per personalizzare contenuti e comunicazioni basate sui tuoi interessi nell''app M1SSION™.

### ⚙️ Cookie di Preferenze
Ricordano le tue impostazioni e preferenze per personalizzare l''esperienza nelle sessioni future.

## Gestione delle Preferenze
Puoi gestire le tue preferenze sui cookie in qualsiasi momento dalle impostazioni dell''app o dal banner dei cookie che appare al primo accesso.

*Ultimo aggiornamento: Gennaio 2025*',
  true,
  now()
) ON CONFLICT (type) DO UPDATE SET
  title = EXCLUDED.title,
  content_md = EXCLUDED.content_md,
  version = EXCLUDED.version,
  published_at = EXCLUDED.published_at;