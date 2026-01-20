-- Insert Game Rules/Regulations into legal documents
INSERT INTO public.legal_documents (
  type,
  title,
  version,
  content_md,
  is_active,
  published_at
) VALUES (
  'game_rules',
  'Regolamento M1SSION™ – Modalità di gioco, premi, meccaniche e diritti',
  '1.0',
  '# REGOLAMENTO UFFICIALE DEL GIOCO – M1SSION™

**Art. 1 – Oggetto del Gioco**

M1SSION™ è un''applicazione interattiva ideata da NIYVORA KFT™, con sede legale in Budapest, Ungheria, che propone un''esperienza di gioco a tema investigativo. L''obiettivo degli utenti è quello di localizzare e conquistare premi reali attraverso un sistema basato su enigmi, missioni, mappe e indizi geolocalizzati. Il gioco è accessibile esclusivamente tramite l''app M1SSION™ disponibile in versione web/PWA.

**Art. 2 – Modalità di Partecipazione**

La partecipazione è riservata a utenti maggiorenni (18+), previa registrazione gratuita tramite indirizzo email.

Ogni utente ha accesso a:
- Indizi settimanali (gratuiti e premium)
- Mappa dinamica interattiva (BUZZ MAPPA™)
- Pannello missioni e storico progressi
- Sezione premi attivi

L''utente può usufruire di funzionalità aggiuntive tramite abbonamenti mensili o microtransazioni (es. acquisto BUZZ).

Ogni account è personale e non trasferibile. È vietata la creazione di account multipli, pena esclusione dal gioco.

**Art. 3 – Tipologie di Premi**

I premi offerti sono reali, autentici, e visibili in app. Possono includere, a titolo esemplificativo e non esaustivo:
- Beni di lusso (es. orologi, auto, articoli moda, elettronica)
- Esperienze (viaggi, eventi, incontri)
- Premi in denaro o gift card

📌 **Trasparenza sui premi:**
- Alcuni premi potranno essere nuovi, altri rigenerati, usati o revisionati ma sempre in condizioni eccellenti, pari al nuovo.
- M1SSION™ garantisce l''autenticità, la funzionalità e la corrispondenza visiva dei premi consegnati.
- Nessun marchio citato è sponsor, affiliato o parte attiva dell''iniziativa.
- Il premio non è cedibile, convertibile in denaro o modificabile salvo diverse indicazioni specifiche.

**Art. 4 – Indizi, BUZZ e Meccaniche di Gioco**

Ogni mese è associato a una "Missione" con premi nascosti. Gli utenti ricevono 12 indizi progressivi, uno al giorno, con difficoltà crescente.

È possibile:
- Ricevere indizi supplementari tramite abbonamento o BUZZ
- Usare BUZZ per attivare la BUZZ MAPPA™ e restringere il raggio di ricerca
- Sottoporre coordinate finali una volta al giorno

Tutti i dati di gioco sono tracciati nel profilo utente. La competizione si rinnova ogni mese.

**Art. 5 – Modalità di Assegnazione dei Premi**

Il premio viene assegnato:
- All''utente che inserisce la coppia di coordinate più precisa rispetto alla posizione reale del premio
- In caso di ex aequo: vince chi ha ottenuto più progressi, indizi trovati e BUZZ utilizzati
- I vincitori riceveranno notifica ufficiale in-app e via email

La verifica dell''identità può includere:
- Documento d''identità valido
- Video o selfie autenticato
- Firma accettazione premi e responsabilità

In caso di rifiuto, frode, o mancata risposta entro 14 giorni, il premio sarà riassegnato.

**Art. 6 – Comportamenti Vietati e Responsabilità dell''Utente**

Sono espressamente vietati:
- Uso di script, bot o automazioni
- Diffusione pubblica di soluzioni o coordinate
- Condivisione credenziali o uso multiplo dell''account
- Offese, insulti, o tentativi di manipolazione del gioco
- Utilizzo dell''app in modo non conforme alle leggi vigenti

NIYVORA KFT™ si riserva il diritto di sospendere, limitare o bannare gli utenti che violano le regole.

**Art. 7 – Privacy, Dati e Consensi**

Il trattamento dei dati è conforme al GDPR. L''utente:
- Può accedere, rettificare o cancellare i dati
- Ha diritto di revocare i consensi
- Può gestire preferenze tramite la sezione "Privacy" dell''app
- Riceve informazioni trasparenti sui cookie tramite banner e sezione dedicata

Tutti i consensi vengono salvati e tracciati tramite Supabase nel rispetto della normativa UE.

**Art. 8 – Recesso e Cancellazione Account**

Ogni utente può cancellare autonomamente il proprio profilo.

La cancellazione:
- È irreversibile
- Comporta la perdita di dati, premi, progressi e abbonamenti attivi
- Può essere revocata entro 30 giorni solo se richiesto per iscritto

NIYVORA KFT™ si riserva il diritto di disattivare account inattivi o sospetti, previa notifica.

**Art. 9 – Proprietà Intellettuale**

Tutti i contenuti presenti in M1SSION™ (codice, design, enigmi, missioni, testi, loghi) sono di esclusiva proprietà di NIYVORA KFT™. Ne è vietata la riproduzione, distribuzione o modifica.

**Art. 10 – Limitazioni di Responsabilità**

NIYVORA KFT™ non è responsabile per:
- Errori tecnici di rete o connessione
- Danni indiretti derivanti dall''uso del gioco
- Uso improprio da parte dell''utente
- Mancata consegna premi per causa di forza maggiore

**Art. 11 – Giurisdizione e Foro Competente**

Il presente regolamento è soggetto alla legge ungherese. Per ogni controversia è competente esclusivamente il Tribunale di Budapest (Ungheria).

---

**Ultimo aggiornamento:** 22 Luglio 2025  
**Versione:** 1.0  
**Email:** legal@m1ssion.com

© 2025 – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™',
  true,
  now()
);