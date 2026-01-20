-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- Update legal documents with complete, compliant content

-- Delete and recreate all legal documents with complete content
DELETE FROM public.legal_documents WHERE type IN ('terms_of_service', 'privacy_policy', 'cookie_policy');

-- Insert comprehensive Terms of Service
INSERT INTO public.legal_documents (type, title, version, content_md, is_active, published_at)
VALUES (
  'terms_of_service',
  'Termini e Condizioni M1SSION™',
  '1.0',
  '# Termini e Condizioni M1SSION™

## 1. Oggetto e Servizi
L''applicazione M1SSION™ è un''esperienza interattiva immersiva basata su missioni, enigmi e premi reali. Il servizio include:
- Sistema di geolocalizzazione per missioni territoriali
- Meccaniche di gioco basate su indizi e puzzle
- Sistema di ricompense e premi fisici/digitali
- Community e classifiche globali

## 2. Requisiti di Accesso
- L''uso è consentito esclusivamente agli utenti maggiorenni
- I minori di 18 anni necessitano del consenso esplicito dei genitori/tutori
- È richiesta la registrazione con dati veritieri
- L''accesso può essere limitato in base alla localizzazione geografica

## 3. Responsabilità dell''Utente
L''utente si impegna a:
- Non utilizzare l''app per scopi illeciti, fraudolenti o dannosi
- Non manipolare i sistemi di geolocalizzazione
- Non condividere account o credenziali
- Rispettare gli altri utenti e le normative locali
- Non tentare di compromettere la sicurezza dell''applicazione

## 4. Proprietà Intellettuale e Copyright
### 4.1 Diritti Riservati
Tutti i contenuti dell''applicazione M1SSION™ sono proprietà esclusiva di:
**Joseph MULÉ – NIYVORA KFT™**

### 4.2 Contenuti Protetti
Sono protetti da copyright e proprietà intellettuale:
- Logo, marchi e identità visiva M1SSION™
- Meccaniche di gioco, algoritmi e logiche di funzionamento
- Interfaccia utente, design e layout
- Narrativa, storyline e contenuti testuali
- Sistema di missioni, indizi e puzzle
- Codice sorgente e architettura software

### 4.3 Divieti Assoluti
È **SEVERAMENTE VIETATA** ogni:
- Riproduzione, anche parziale, dell''applicazione
- Copia o imitazione delle meccaniche di gioco
- Reverse engineering del codice
- Estrazione di dati o contenuti
- Creazione di applicazioni simili o derivative
- Utilizzo commerciale non autorizzato

## 5. Limitazioni di Responsabilità
NIYVORA KFT™ non è responsabile per:
- Danni derivanti dall''uso dell''applicazione
- Perdite di dati o interruzioni del servizio
- Comportamenti degli utenti durante le missioni fisiche
- Danni a terzi derivanti dall''utilizzo dell''app

## 6. Modifiche ai Termini
Ci riserviamo il diritto di modificare i presenti termini in qualsiasi momento. Le modifiche saranno comunicate tramite:
- Notifica in-app
- Email agli utenti registrati
- Aggiornamento della data di "Ultimo aggiornamento"

## 7. Giurisdizione e Legge Applicabile
I presenti Termini sono regolati dalla legge italiana e dell''Unione Europea. Per qualsiasi controversia è competente il Foro di Milano, Italia.

## 8. Clausola di Salvaguardia
Se una disposizione dei presenti Termini dovesse essere dichiarata invalida, le restanti disposizioni rimarranno pienamente efficaci.

## 9. Contatti Legali
Per questioni legali, violazioni o richieste di rimozione:
**Email:** legal@m1ssion.app
**Riferimento:** Joseph MULÉ – NIYVORA KFT™

---

**È vietata ogni riproduzione, copia, distribuzione o rielaborazione, anche parziale, dell''applicazione M1SSION™, del concept di gioco, del regolamento, delle missioni, dell''interfaccia utente o della narrativa. Ogni infrazione sarà perseguita legalmente ai sensi della normativa sulla proprietà intellettuale (art. 2575 c.c., L. 633/1941 e Direttiva UE 2001/29/CE).**

*Ultimo aggiornamento: 22 Gennaio 2025*

---
© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™',
  true,
  now()
);

-- Insert comprehensive Privacy Policy (GDPR compliant)
INSERT INTO public.legal_documents (type, title, version, content_md, is_active, published_at)
VALUES (
  'privacy_policy',
  'Privacy Policy M1SSION™',
  '1.0',
  '# Privacy Policy M1SSION™
**Informativa sul trattamento dei dati personali**
*Ai sensi del Regolamento UE 2016/679 (GDPR)*

## 1. Titolare del Trattamento
**NIYVORA KFT™**
- Rappresentante legale: Joseph MULÉ
- Email: privacy@m1ssion.app
- App: M1SSION™

## 2. Tipologie di Dati Raccolti

### 2.1 Dati di Registrazione
- Nome utente e email
- Password (criptata)
- Data di registrazione
- Avatar (se caricato)

### 2.2 Dati di Geolocalizzazione
- Posizione GPS (se autorizzata)
- Cronologia delle posizioni durante le missioni
- Aree geografiche visitate
- Tempo di permanenza nelle location

### 2.3 Dati di Utilizzo
- Log di navigazione nell''app
- Sessioni di gioco e durata
- Interazioni con contenuti
- Performance e progressi nelle missioni
- Statistiche di gioco e punteggi

### 2.4 Dati Tecnici
- Tipo di dispositivo e sistema operativo
- Indirizzo IP e identificatori univoci
- Versione dell''app utilizzata
- Crash report e log di debug
- Preferenze e impostazioni

## 3. Finalità del Trattamento
I tuoi dati sono trattati per:

### 3.1 Fornitura del Servizio
- Funzionamento dell''applicazione M1SSION™
- Gestione account utente
- Salvataggio progressi di gioco
- Sistema di classifiche e premi

### 3.2 Miglioramento dell''Esperienza
- Analisi dell''utilizzo per ottimizzazioni
- Personalizzazione contenuti e missioni
- Debug e risoluzione problemi tecnici
- Sviluppo nuove funzionalità

### 3.3 Comunicazioni
- Notifiche di gioco e missioni
- Aggiornamenti dell''applicazione
- Comunicazioni di sicurezza
- Newsletter (solo se consenso esplicito)

### 3.4 Adempimenti Legali
- Conformità a obblighi di legge
- Prevenzione frodi e abusi
- Sicurezza informatica
- Cooperazione con autorità competenti

## 4. Base Giuridica del Trattamento
- **Consenso:** Per geolocalizzazione e newsletter
- **Contratto:** Per fornitura del servizio M1SSION™
- **Interesse legittimo:** Per miglioramenti e sicurezza
- **Obbligo legale:** Per adempimenti normativi

## 5. Condivisione dei Dati
I tuoi dati NON sono venduti a terzi. Possono essere condivisi con:
- **Fornitori tecnici:** per hosting e infrastruttura cloud
- **Servizi di analisi:** in forma anonima/pseudonima
- **Autorità competenti:** solo se richiesto dalla legge
- **Partner commerciali:** solo dati aggregati e anonimi

## 6. Conservazione dei Dati
- **Account attivi:** per la durata del servizio
- **Account cancellati:** 30 giorni per ripristino, poi eliminazione
- **Dati di log:** massimo 2 anni
- **Dati legali:** secondo normative applicabili

## 7. I Tuoi Diritti (GDPR)
Hai il diritto di:
- **Accesso:** ottenere copia dei tuoi dati
- **Rettifica:** correggere dati inesatti
- **Cancellazione:** eliminare i tuoi dati
- **Portabilità:** ricevere dati in formato standard
- **Limitazione:** limitare alcuni trattamenti
- **Opposizione:** opporti al trattamento
- **Revoca consenso:** ritirare il consenso dato

Per esercitare i tuoi diritti: privacy@m1ssion.app

## 8. Sicurezza dei Dati
Implementiamo misure tecniche e organizzative per proteggere i tuoi dati:
- Crittografia dei dati sensibili
- Accesso limitato su base need-to-know
- Backup sicuri e ridondanti
- Monitoraggio attività sospette
- Aggiornamenti di sicurezza regolari

## 9. Trasferimenti Internazionali
I dati possono essere trasferiti in paesi terzi solo se:
- Paesi con decisione di adeguatezza UE
- Garanzie appropriate (Standard Contractual Clauses)
- Consenso esplicito dell''utente

## 10. Cookie e Tracciamento
Per informazioni su cookie e tecnologie di tracciamento, consulta la nostra **Cookie Policy**.

## 11. Minori
L''app M1SSION™ non è destinata a minori di 18 anni. Se vieni a conoscenza che un minore ha fornito dati personali, contattaci immediatamente.

## 12. Modifiche alla Privacy Policy
Eventuali modifiche saranno comunicate tramite:
- Notifica in-app
- Email agli utenti registrati
- Aggiornamento di questa pagina

## 13. Contatti e Reclami
**Data Protection Officer:** Joseph MULÉ
**Email:** privacy@m1ssion.app

Hai il diritto di presentare reclamo all''Autorità Garante per la Protezione dei Dati Personali.

---

*Ultimo aggiornamento: 22 Gennaio 2025*

---
© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™',
  true,
  now()
);

-- Insert comprehensive Cookie Policy (ePrivacy compliant)
INSERT INTO public.legal_documents (type, title, version, content_md, is_active, published_at)
VALUES (
  'cookie_policy',
  'Cookie Policy M1SSION™',
  '1.0',
  '# Cookie Policy M1SSION™
**Informativa sull''uso dei Cookie e tecnologie simili**
*Conforme alla Direttiva ePrivacy 2002/58/CE*

## Cosa sono i Cookie
I cookie sono piccoli file di testo memorizzati sul tuo dispositivo quando utilizzi l''applicazione M1SSION™. Ci permettono di:
- Migliorare la tua esperienza di gioco
- Ricordare le tue preferenze
- Analizzare l''utilizzo dell''app
- Personalizzare contenuti e pubblicità

## Tipologie di Cookie Utilizzati

### 🔒 Cookie Strettamente Necessari
**Sempre attivi - Non richiedono consenso**
- **Autenticazione:** mantengono la sessione di login
- **Sicurezza:** proteggono da attacchi informatici  
- **Funzionalità core:** salvano progressi e impostazioni
- **Bilanciamento carico:** ottimizzano le performance
- **Durata:** sessione o 30 giorni massimo

### 📊 Cookie Analitici e Performance
**Richiedono consenso**
- **Analytics:** misurano utilizzo e performance
- **Heatmap:** analizzano interazioni con l''interfaccia
- **Error tracking:** identificano e risolvono bug
- **A/B testing:** testano miglioramenti dell''app
- **Durata:** 2 anni massimo

**Servizi utilizzati:**
- Google Analytics 4 (anonimizzato)
- Hotjar (registrazioni anonime)
- Sentry (crash reporting)

### 📢 Cookie di Marketing e Pubblicità
**Richiedono consenso esplicito**
- **Profilazione:** personalizzano pubblicità
- **Retargeting:** mostrano annunci rilevanti
- **Social media:** integrazione con piattaforme sociali
- **Affiliate tracking:** monitorano conversioni
- **Durata:** 13 mesi massimo

**Partner pubblicitari:**
- Google Ads
- Facebook/Meta Pixel
- TikTok Pixel

### ⚙️ Cookie di Personalizzazione
**Richiedono consenso**
- **Preferenze:** ricordano lingua e tema
- **Raccomandazioni:** suggeriscono contenuti
- **Geolocalizzazione:** salvano location preferite
- **UI customization:** layout personalizzati
- **Durata:** 1 anno

## Cookie di Terze Parti
L''app M1SSION™ può includere servizi di terze parti che impostano i propri cookie:

### Servizi Integrati
- **Google Maps:** per funzionalità di mappa
- **YouTube:** per contenuti video
- **Social Login:** Facebook, Google, Apple
- **Payment processors:** Stripe, PayPal
- **Cloud services:** Firebase, Supabase

## Gestione delle Tue Preferenze

### Nel Browser/App
- **Impostazioni App:** vai su Impostazioni > Privacy > Cookie
- **Browser mobile:** cancella dati app dalle impostazioni dispositivo
- **Desktop:** usa le impostazioni del browser

### Banner Cookie
Al primo accesso vedrai un banner dove puoi:
- ✅ Accettare tutti i cookie
- ⚙️ Personalizzare le tue preferenze
- ❌ Rifiutare cookie non necessari
- 📋 Leggere dettagli su ogni categoria

### Modifica Preferenze
Puoi modificare le tue scelte in qualsiasi momento:
1. Vai su **Impostazioni > Privacy**
2. Clicca su **"Gestisci Cookie"**
3. Seleziona/deseleziona le categorie
4. Salva le modifiche

## Conseguenze del Rifiuto
Se rifiuti alcuni cookie:
- ✅ **Funzionalità base:** sempre disponibili
- ⚠️ **Personalizzazione:** ridotta o assente
- ❌ **Analytics:** non potremo migliorare l''app
- ❌ **Pubblicità:** meno rilevante per te

## Cookie di Sessione vs Persistenti
- **Sessione:** cancellati alla chiusura dell''app
- **Persistenti:** rimangono per il periodo indicato
- **Sicurezza:** tutti i cookie sono protetti da crittografia

## Aggiornamenti Automatici
I cookie vengono aggiornati automaticamente per:
- Nuove funzionalità dell''app
- Miglioramenti di sicurezza
- Conformità normative
- Ottimizzazioni performance

## Diritti dell''Utente
Hai il diritto di:
- Conoscere quali cookie utilizziamo
- Dare o negare il consenso
- Modificare le preferenze in qualsiasi momento
- Cancellare tutti i cookie
- Ricevere informazioni sui trasferimenti dati

## Normative di Riferimento
Questa Cookie Policy è conforme a:
- **GDPR:** Regolamento UE 2016/679
- **ePrivacy:** Direttiva 2002/58/CE
- **Codice Privacy:** D.Lgs. 196/2003
- **Provvedimento Garante:** 8 maggio 2014

## Contatti
Per domande sui cookie o per esercitare i tuoi diritti:
**Email:** cookies@m1ssion.app  
**Responsabile:** Joseph MULÉ – NIYVORA KFT™

## Controllo Cookie Avanzato
**Browser Settings:**
- Chrome: Impostazioni > Privacy e sicurezza > Cookie
- Safari: Preferenze > Privacy > Cookie e dati
- Firefox: Opzioni > Privacy e sicurezza > Cookie

**Tools di controllo:**
- Google Analytics Opt-out
- Facebook Off-Facebook Activity
- Industry opt-out platforms

---

*Ultimo aggiornamento: 22 Gennaio 2025*

---
© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™',
  true,
  now()
);

-- Insert Disclaimer document
INSERT INTO public.legal_documents (type, title, version, content_md, is_active, published_at)
VALUES (
  'disclaimer',
  'Disclaimer M1SSION™',
  '1.0',
  '# Disclaimer M1SSION™

## Esclusione di Responsabilità

### Marchi e Proprietà Intellettuale
I marchi, loghi, nomi commerciali e altri segni distintivi menzionati nell''applicazione M1SSION™ appartengono ai rispettivi proprietari e NON sponsorizzano, avallano o sono affiliati in alcun modo con:
- L''applicazione M1SSION™
- NIYVORA KFT™  
- Joseph MULÉ

### Utilizzo Referenziale
Qualsiasi riferimento a marchi terzi è utilizzato esclusivamente a scopo:
- Informativo e descrittivo
- Di identificazione geografica
- Di riferimento culturale o storico
- Educational o giornalistico

### Non Affiliazione
M1SSION™ dichiara espressamente di NON essere:
- Sponsorizzata da alcun marchio menzionato
- Affiliata con aziende o enti citati
- Autorizzata da proprietari di marchi terzi
- Partner commerciale di brand referenziati

### Limitazione di Responsabilità
NIYVORA KFT™ non è responsabile per:
- Contenuti generati dagli utenti
- Informazioni di terze parti
- Link esterni o servizi integrati
- Danni derivanti dall''uso dell''app
- Interruzioni del servizio
- Perdite di dati utente

### Contenuti User-Generated
Gli utenti sono esclusivamente responsabili per:
- Contenuti caricati o condivisi
- Rispetto dei diritti di terzi
- Violazioni di copyright o privacy
- Comportamenti durante le missioni

### Uso a Proprio Rischio
L''utilizzo dell''applicazione M1SSION™ avviene a esclusivo rischio e responsabilità dell''utente.

---

*Ultimo aggiornamento: 22 Gennaio 2025*

---
© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™',
  true,
  now()
);

-- Insert SafeCreative certification info
INSERT INTO public.legal_documents (type, title, version, content_md, is_active, published_at)
VALUES (
  'safecreative',
  'Certificazione Proprietà M1SSION™',
  '1.0',
  '# Certificazione Proprietà Intellettuale M1SSION™

## Proprietà e Copyright
L''applicazione **M1SSION™** e tutti i suoi componenti sono proprietà intellettuale registrata e protetta di:

**Joseph MULÉ – NIYVORA KFT™**

## Elementi Protetti
La protezione copyright si estende a:
- **Concept originale** dell''applicazione M1SSION™
- **Meccaniche di gioco** innovative e uniche
- **Algoritmi proprietari** per geolocalizzazione
- **Sistema di missioni** e logica di gioco
- **Interfaccia utente** e design dell''app
- **Narrativa e storytelling** integrati
- **Logo, branding** e identità visiva
- **Architettura software** e codice sorgente

## Registrazioni e Depositi
I diritti di proprietà intellettuale sono documentati presso:
- **Registro pubblico** delle opere creative
- **Sistemi internazionali** di protezione copyright
- **Certificazioni digitali** blockchain-based
- **Depositi legali** presso uffici competenti

## Data di Creazione
**Prima pubblicazione:** Gennaio 2025  
**Sviluppo:** 2024-2025  
**Registrazione copyright:** In corso

## Tutela Internazionale
La protezione si estende a:
- **Unione Europea** (Direttiva 2001/29/CE)
- **Italia** (Legge 633/1941)
- **Convenzione di Berna** per opere letterarie e artistiche
- **Trattati WIPO** su copyright e performance

## Violazioni e Contraffazioni
Qualsiasi utilizzo non autorizzato sarà perseguito legalmente secondo:
- **Art. 2575** del Codice Civile Italiano
- **Legge 633/1941** sul Diritto d''Autore
- **Normative UE** sulla proprietà intellettuale
- **Convenzioni internazionali** applicabili

## Licenze e Autorizzazioni
Per richieste di:
- Licenze d''uso commerciale
- Partnership e collaborazioni  
- Utilizzi derivati o ispirati
- Citazioni accademiche o giornalistiche

**Contattare:** legal@m1ssion.app

## Riconoscimento Tecnologie Terze
M1SSION™ utilizza librerie e servizi di terze parti secondo le rispettive licenze:
- **Open source libraries** (come da LICENSE files)
- **API services** (Google Maps, etc.)
- **Cloud platforms** (secondo ToS provider)

Tutti gli utilizzi sono conformi alle licenze originali.

## Dichiarazione di Autenticità
Il sottoscritto **Joseph MULÉ**, in qualità di creatore e proprietario dell''applicazione M1SSION™, dichiara sotto la propria responsabilità che:

1. L''opera è **completamente originale**
2. Non viola **diritti di terzi**
3. È stata sviluppata **autonomamente**
4. Rappresenta il **frutto della propria creatività**

---

**Firma digitale:** Joseph MULÉ  
**Data:** 22 Gennaio 2025  
**Luogo:** Milano, Italia

---

*Per verifiche di autenticità o segnalazioni di violazioni:*  
**Email:** copyright@m1ssion.app  
**Legal:** legal@m1ssion.app

---
© 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™',
  true,
  now()
);