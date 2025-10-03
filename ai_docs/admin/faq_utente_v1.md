# FAQ Utente — M1SSION™
<!-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™ -->

**Version:** 1.0  
**Last Updated:** 2025-10-03  
**Status:** OFFICIAL PRODUCT BIBLE

---

## Onboarding & Account

### Q1: Come creo un account M1SSION?
**A:** Scarica l'app (iOS/Android/PWA), tap su "Iscriviti", inserisci email + password. Riceverai email conferma. Dopo verifica email, completa profilo investigativo (4 domande rapide) per sbloccare esperienza personalizzata.

### Q2: Posso usare M1SSION senza creare account?
**A:** No, account obbligatorio per tracciare progressione, indizi sbloccati, e partecipare alle missioni. Dati GDPR-compliant, no vendita a terze parti.

### Q3: Ho dimenticato la password, come recuperarla?
**A:** Tap "Password dimenticata?" nella schermata login → inserisci email → riceverai link reset password valido 1h. Segui link e crea nuova password.

---

## BUZZ & BUZZ Map

### Q4: Cos'è esattamente BUZZ?
**A:** BUZZ è un'azione di scansione geolocalizzata che sblocca indizi/aree. Costa secondo tier abbonamento, ha raggio 2 km, e cooldown variabile (24h Free → nessuno Titanium). Vedi documento `buzz-and-map.md` per dettagli completi.

### Q5: Perché il mio BUZZ è in cooldown?
**A:** Ogni tier ha cooldown anti-abuso: Free 24h, Silver 12h, Gold 8h, Black 4h, Titanium nessuno. Upgrade tier per ridurre cooldown. Cooldown inizia da ultimo BUZZ eseguito.

### Q6: Cos'è BUZZ Map e come differisce da BUZZ?
**A:** BUZZ Map è BUZZ contestualizzato nella mappa con visualizzazione immediata aree/premi. Primo BUZZ Map speciale: 500 km raggio a €4,99. Differenza chiave: BUZZ = azione rapida, BUZZ Map = esplorazione strategica mappa.

### Q7: Il primo BUZZ Map costa davvero €4,99?
**A:** Sì, è offerta lancio per incentivare esplorazione. 500 km raggio (enorme!) a prezzo accessibile. Dopo primo BUZZ Map, raggio diminuisce progressivamente: 500→450→400...→50 km (minimo). Prezzo resta €4,99.

### Q8: Quanti BUZZ Map posso fare al mese?
**A:** Dipende da tier: Free/Silver/Gold = 0 (feature non disponibile), Black = 1/mese, Titanium = 2/mese. Cooldown 30 giorni (Black) o 15 giorni (Titanium) tra un BUZZ Map e l'altro.

---

## Final Shot & Premi

### Q9: Cos'è Final Shot?
**A:** Final Shot è tentativo finale di claim premio quando ritieni di aver trovato posizione esatta. Richiede GPS accuracy <20m, verifica distanza da target (<50m per successo). Tentativi limitati per tier: Free 2, Silver 3, Gold 5, Black 8, Titanium 12.

### Q10: Quanti tentativi Final Shot ho?
**A:** Vedi Q9 per limiti tier. Cooldown tra tentativi: Free/Silver 2h, Gold 1h, Black 30min, Titanium nessuno. Final Shot gratuito (incluso piano).

### Q11: Cosa succede se fallisco Final Shot?
**A:** Ricevi feedback: distanza esatta da target + direzione cardinale. Cooldown applicato. Tentativi rimanenti mostrati. Titanium riceve suggerimenti AI Norah ("Prova a spostarti verso Nord di ~200m").

### Q12: Come so se sono abbastanza vicino per Final Shot?
**A:** Decifra indizi sbloccati! App non dà hint preventivi (eccetto Titanium post-fail). Tolleranza successo: <50m automatico, 50-100m review manuale admin.

---

## Abbonamenti & Pagamenti

### Q13: Quali sono i piani disponibili?
**A:** 5 tier: Free (gratis), Silver (€9,99/mese), Gold (€19,99/mese), Black (€49,99/mese), Titanium (€99,99/mese). Differenze: limiti BUZZ, BUZZ Map, Final Shot, early access missioni, memoria AI Norah. Vedi `subscriptions.md` per tabella completa.

### Q14: Posso cambiare piano in qualsiasi momento?
**A:** Sì. Upgrade immediato con prorata. Downgrade effettivo a fine periodo pagato (continui con feature premium fino a scadenza). Gestisci abbonamento da Profilo → Abbonamento.

### Q15: Come funzionano i pagamenti?
**A:** Stripe (PCI-DSS Level 1). Carta credito/debito, 3D Secure obbligatorio >€50. M1SSION non memorizza dati carta. Pagamenti mensili auto-rinnovati. Cancella quando vuoi (no penali).

### Q16: Posso ottenere rimborso?
**A:** Dipende: se hai utilizzato servizi premium (BUZZ/BUZZ Map/early access), no refund generalmente. Per errori tecnici/addebiti non autorizzati, contatta support@m1ssion.com entro 48h. Vedi `policies.md` Refund Policy.

---

## GPS & Privacy

### Q17: Perché M1SSION richiede GPS?
**A:** BUZZ, BUZZ Map, Final Shot richiedono posizione reale per fair play. GPS usato SOLO durante azioni attive (no tracking background continuo). Coordinate aggregate anonime per analytics, cancellate dopo 90 giorni. GDPR-compliant.

### Q18: Cosa succede se uso GPS falso (spoofing)?
**A:** Violazione Fair Play Policy. Rilevamento automatico via pattern GPS + accuracy check. Sanzioni: 1° warning, 2° ban 7gg, 3° ban permanente. Appeal via support@m1ssion.com.

### Q19: M1SSION vende i miei dati?
**A:** No, mai. Dati usati solo per servizio M1SSION. No vendita a advertisers/terze parti. Vedi Privacy Policy completa: https://m1ssion.com/privacy (TODO: link reale)

---

## NORAH AI Assistant

### Q20: Chi è NORAH?
**A:** NORAH è l'AI Assistant M1SSION che ti aiuta con domande, indizi, strategie. Risponde in linguaggio naturale, ricorda conversazioni (se consenso dato), e adatta risposte a tier/progressione. Disponibile 24/7 dalla schermata Chat.

### Q21: NORAH ricorda le nostre conversazioni?
**A:** Sì, se hai dato consenso "Memoria AI" (attiva default per Silver+, opt-in Free). Memoria dura 90 giorni poi cancellata. Puoi disattivare da Impostazioni → Privacy → Memoria AI. Conversazioni anonimizzate per training AI.

### Q22: NORAH può darmi hint per Final Shot?
**A:** Solo Titanium tier, e solo DOPO tentativo fallito. Hint direzionali (es. "Prova Nord 200m"). Prima del primo tentativo, NORAH dà suggerimenti generici basati su indizi sbloccati.

---

## Bug & Supporto

### Q23: Ho trovato un bug, come lo segnalo?
**A:** Tap Profilo → Help → "Segnala Bug" oppure email support@m1ssion.com con: descrizione bug, screenshot, device (iOS/Android), versione app. Risposta entro 48h lavorative.

### Q24: L'app crasha o non si carica, cosa faccio?
**A:** 1) Forza chiusura app, 2) Riavvia device, 3) Verifica connessione internet, 4) Aggiorna app (App Store/Play Store), 5) Se persiste: segnala bug (vedi Q23).

### Q25: Non ricevo notifiche, perché?
**A:** Verifica: 1) Notifiche abilitate in Impostazioni device, 2) Permessi M1SSION accettati, 3) Impostazioni → Notifiche nell'app = ON. Se problema persiste, logout/login per re-sync token push.

---

## Note per Developer

- **FAQ aggiornamento:** Quarterly review + on-demand per feature/policy changes
- **Localizzazione:** IT (primario), EN/FR via i18n system
- **Link interni:** Usare deep links `m1ssion://faq/Q12` per riferimenti cross-document
- **Analytics:** Trackare FAQ click per identificare pain points utenti

---

**IMPORTANT:** L'assistente AI deve sempre linkare FAQ specifica quando risponde a domande comuni utenti. Formato: "Vedi FAQ Q12 per dettagli Final Shot distanza"

<!-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™ -->
