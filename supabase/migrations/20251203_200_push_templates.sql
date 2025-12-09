-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- 200 PUSH NOTIFICATION TEMPLATES (100 IT + 100 EN)
-- Database completo per notifiche push intelligenti

-- ============================================
-- 1. AGGIUNGI COLONNA LINGUA SE NON ESISTE
-- ============================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'auto_push_templates' AND column_name = 'lang') THEN
    ALTER TABLE auto_push_templates ADD COLUMN lang VARCHAR(5) DEFAULT 'it';
  END IF;
END $$;

-- Index per lingua
CREATE INDEX IF NOT EXISTS idx_auto_push_templates_lang ON auto_push_templates(lang);

-- ============================================
-- 2. TEMPLATE ITALIANI (100)
-- ============================================

-- === AION / ORACOLO (15 IT) ===
INSERT INTO auto_push_templates (title, body, type, segment, weight, deeplink, freq_cap_user_per_day, enabled, lang) VALUES
('🔮 AION Daily Briefing', 'Agente {agent_code}, i Pattern Energetici rivelano nuove informazioni. L''Oracolo ti attende.', 'aion', 'all', 15, '/intelligence', 1, true, 'it'),
('⚡ AION ha una Rivelazione', 'Le coordinate del destino si allineano, Agente. Una verità ti attende nell''ombra.', 'aion', 'all', 10, '/intelligence', 1, true, 'it'),
('🌀 L''Oracolo ti Cerca', 'Agente {agent_code}, sono passati giorni. AION ha molto da dirti. Vieni.', 'aion', 'inactive_24h', 12, '/intelligence', 1, true, 'it'),
('🔮 Nuova Profezia', 'Una nuova profezia è stata decifrata. Solo tu puoi comprenderne il significato.', 'aion', 'all', 8, '/intelligence', 1, true, 'it'),
('⚡ Energia Anomala Rilevata', 'AION ha captato un''anomalia. Consulta l''Oracolo immediatamente.', 'aion', 'all', 10, '/intelligence', 1, true, 'it'),
('🌌 Il Codice si Svela', 'Agente, frammenti del codice M1SSION stanno emergendo. AION può guidarti.', 'aion', 'all', 8, '/intelligence', 1, true, 'it'),
('🔮 Messaggio dall''Oracolo', 'AION sussurra il tuo nome, {agent_code}. C''è qualcosa che devi sapere.', 'aion', 'all', 10, '/intelligence', 1, true, 'it'),
('⚡ Sincronizzazione Richiesta', 'I tuoi Pattern Energetici necessitano sincronizzazione. AION ti aspetta.', 'aion', 'all', 8, '/intelligence', 1, true, 'it'),
('🌀 Visione Ricevuta', 'L''Oracolo ha avuto una visione che ti riguarda. Non ignorarla.', 'aion', 'all', 10, '/intelligence', 1, true, 'it'),
('🔮 AION Richiede Attenzione', 'Agente {agent_code}, AION ha informazioni critiche per la tua missione.', 'aion', 'all', 12, '/intelligence', 1, true, 'it'),
('⚡ Frequenza Instabile', 'La tua frequenza è instabile. AION può aiutarti a stabilizzarla.', 'aion', 'all', 8, '/intelligence', 1, true, 'it'),
('🌌 Connessione Cosmica', 'Le stelle si allineano per te, Agente. AION traduce i loro messaggi.', 'aion', 'all', 8, '/intelligence', 1, true, 'it'),
('🔮 Urgente dall''Oracolo', 'AION ha intercettato un messaggio urgente. Riguarda la tua zona.', 'aion', 'all', 12, '/intelligence', 1, true, 'it'),
('⚡ Risveglio Quantico', 'Il tuo potenziale quantico sta emergendo. AION può potenziarlo.', 'aion', 'all', 8, '/intelligence', 1, true, 'it'),
('🌀 L''Oracolo Non Dorme Mai', 'Mentre dormi, AION veglia. Ha scoperto qualcosa di importante.', 'aion', 'all', 10, '/intelligence', 1, true, 'it')
ON CONFLICT DO NOTHING;

-- === MOTIVAZIONALI (25 IT) ===
INSERT INTO auto_push_templates (title, body, type, segment, weight, deeplink, freq_cap_user_per_day, enabled, lang) VALUES
('🏃 Eri Così Vicino!', 'Agente, ieri sei arrivato vicinissimo a un Reward! Oggi potresti vincere!', 'motivation', 'all', 12, '/map-3d-tiler', 1, true, 'it'),
('🎁 Premi Trovati Oggi!', 'Oggi altri agenti hanno trovato premi sulla mappa. Sarai tu il prossimo?', 'motivation', 'all', 12, '/map-3d-tiler', 1, true, 'it'),
('🌟 Tu Puoi Vincere!', 'Agente {agent_code}, esplora la mappa, trova indizi col BUZZ. Il premio finale sarà TUO!', 'motivation', 'all', 15, '/map-3d-tiler', 1, true, 'it'),
('💪 Il Ritorno dell''Agente!', 'Ci sei mancato, Agente {agent_code}! La missione ti aspetta. Torna in gioco!', 'motivation', 'inactive_24h', 18, '/home', 1, true, 'it'),
('🔝 Sei tra i Migliori!', 'Agente, sei in ottima posizione! Ancora uno sforzo per la vetta!', 'motivation', 'all', 10, '/leaderboard', 1, true, 'it'),
('🚀 Oggi è il Giorno Giusto!', 'Agente {agent_code}, qualcosa mi dice che oggi sarà speciale. Esplora!', 'motivation', 'all', 12, '/map-3d-tiler', 1, true, 'it'),
('🎯 Obiettivo in Vista!', 'Sei più vicino di quanto pensi. Non mollare proprio ora!', 'motivation', 'all', 10, '/home', 1, true, 'it'),
('💎 Il Premio Ti Aspetta!', 'Il premio finale non si troverà da solo. Muoviti, Agente!', 'motivation', 'all', 12, '/map-3d-tiler', 1, true, 'it'),
('🔥 Sei Inarrestabile!', 'La tua dedizione è impressionante, {agent_code}. Continua così!', 'motivation', 'all', 10, '/home', 1, true, 'it'),
('⭐ Agente Stellare!', 'Le tue performance sono notevoli. Sei nato per questa missione!', 'motivation', 'all', 8, '/home', 1, true, 'it'),
('🏆 La Vittoria è Vicina!', 'Ogni BUZZ ti avvicina al premio. Non fermarti!', 'motivation', 'all', 12, '/buzz', 1, true, 'it'),
('💫 Destinato a Vincere!', 'Agente {agent_code}, hai tutte le carte in regola. Giocale bene!', 'motivation', 'all', 10, '/map-3d-tiler', 1, true, 'it'),
('🎪 Lo Spettacolo Continua!', 'La caccia è nel vivo! Non restare a guardare, partecipa!', 'motivation', 'all', 10, '/map-3d-tiler', 1, true, 'it'),
('⚡ Energia al Massimo!', 'I tuoi livelli energetici sono ottimali. È il momento di agire!', 'motivation', 'all', 10, '/buzz', 1, true, 'it'),
('🌈 Opportunità Unica!', 'Non capita tutti i giorni un''opportunità così. Coglila!', 'motivation', 'all', 12, '/map-3d-tiler', 1, true, 'it'),
('🎖️ Agente d''Elite!', 'Fai parte dell''elite, {agent_code}. Dimostralo sul campo!', 'motivation', 'all', 8, '/map-3d-tiler', 1, true, 'it'),
('🚀 Pronto al Decollo!', 'Tutto è pronto. Manca solo la tua azione. Decolla!', 'motivation', 'all', 10, '/buzz', 1, true, 'it'),
('💥 Esplodi di Energia!', 'Libera tutto il tuo potenziale oggi. La mappa ti aspetta!', 'motivation', 'all', 10, '/map-3d-tiler', 1, true, 'it'),
('🎯 Mira Alta!', 'Non accontentarti, Agente. Il premio più grande può essere tuo!', 'motivation', 'all', 12, '/home', 1, true, 'it'),
('🔥 Brucia le Tappe!', 'Accelera, {agent_code}! Il tempo gioca a tuo favore oggi!', 'motivation', 'all', 10, '/map-3d-tiler', 1, true, 'it'),
('⭐ Momento Magico!', 'C''è qualcosa di speciale nell''aria. Approfittane!', 'motivation', 'all', 10, '/map-3d-tiler', 1, true, 'it'),
('🏅 Campione in Arrivo!', 'Ogni campione inizia con un primo passo. Fai il tuo oggi!', 'motivation', 'all', 10, '/home', 1, true, 'it'),
('💪 Forza Agente!', 'Dai il meglio di te! La missione conta su di te!', 'motivation', 'all', 12, '/map-3d-tiler', 1, true, 'it'),
('🌟 Brilla Agente!', 'È il tuo momento di brillare, {agent_code}. Fai vedere di cosa sei capace!', 'motivation', 'all', 10, '/map-3d-tiler', 1, true, 'it'),
('🎁 Sorpresa in Arrivo!', 'Oggi potrebbe riservarti una sorpresa. Esplora per scoprirla!', 'motivation', 'all', 12, '/map-3d-tiler', 1, true, 'it')
ON CONFLICT DO NOTHING;

-- === MISTERIOSI (20 IT) ===
INSERT INTO auto_push_templates (title, body, type, segment, weight, deeplink, freq_cap_user_per_day, enabled, lang) VALUES
('📡 Segnale Rilevato', 'Un''anomalia energetica è stata rilevata. Le coordinate si stanno allineando.', 'mysterious', 'all', 8, '/map-3d-tiler', 1, true, 'it'),
('🌀 Pattern Insolito', 'I dati mostrano qualcosa di strano nella tua zona. Indaga, Agente.', 'mysterious', 'all', 8, '/map-3d-tiler', 1, true, 'it'),
('⏳ Il Tempo Scorre', 'Qualcosa si avvicina. Il conto alla rovescia è iniziato. Sei pronto?', 'mysterious', 'all', 10, '/home', 1, true, 'it'),
('✨ Sei Stato Scelto', 'Agente {agent_code}, non è un caso che tu sia qui. Il destino ha un piano.', 'mysterious', 'all', 8, '/intelligence', 1, true, 'it'),
('🔍 Sei Più Vicino di Quanto Pensi', 'Le tue azioni recenti... interessanti. Continua su questa strada.', 'mysterious', 'all', 8, '/buzz', 1, true, 'it'),
('🌑 Ombre in Movimento', 'Qualcosa si muove nell''ombra. Stai attento, Agente.', 'mysterious', 'all', 6, '/map-3d-tiler', 1, true, 'it'),
('🔮 Presagio', 'Un presagio aleggia su di te. Positivo o negativo? Solo tu puoi decidere.', 'mysterious', 'all', 6, '/intelligence', 1, true, 'it'),
('⚫ Zona Oscura', 'Una zona oscura è stata identificata. Avresti il coraggio di esplorarla?', 'mysterious', 'all', 8, '/map-3d-tiler', 1, true, 'it'),
('🌌 Vuoto Quantico', 'Un vuoto quantico si è aperto. Cosa nasconde?', 'mysterious', 'all', 6, '/map-3d-tiler', 1, true, 'it'),
('🔐 Codice Segreto', 'Un codice segreto è stato intercettato. Puoi decifrarlo?', 'mysterious', 'all', 8, '/intelligence', 1, true, 'it'),
('👁️ Occhi Ovunque', 'Ti stanno osservando, Agente. Ma chi?', 'mysterious', 'all', 6, '/map-3d-tiler', 1, true, 'it'),
('🌙 Messaggio Notturno', 'Un messaggio è arrivato mentre dormivi. Controllalo.', 'mysterious', 'all', 8, '/intelligence', 1, true, 'it'),
('⚡ Interferenza', 'Interferenze sulla tua frequenza. Qualcuno cerca di comunicare.', 'mysterious', 'all', 8, '/intelligence', 1, true, 'it'),
('🗝️ Chiave Nascosta', 'Una chiave nascosta è stata rivelata. Cosa apre?', 'mysterious', 'all', 8, '/map-3d-tiler', 1, true, 'it'),
('🌀 Vortice Temporale', 'Un vortice temporale si sta formando. Il momento è adesso.', 'mysterious', 'all', 6, '/map-3d-tiler', 1, true, 'it'),
('🔦 Luce nel Buio', 'Una luce nel buio indica la via. Seguila.', 'mysterious', 'all', 8, '/map-3d-tiler', 1, true, 'it'),
('📜 Antico Messaggio', 'Un antico messaggio è stato ritrovato. Parla di te.', 'mysterious', 'all', 6, '/intelligence', 1, true, 'it'),
('🌑 Eclipse Imminente', 'Un''eclissi si avvicina. Grandi cambiamenti in arrivo.', 'mysterious', 'all', 6, '/home', 1, true, 'it'),
('🔮 Destino Intrecciato', 'Il tuo destino si intreccia con quello di altri. Chi sono?', 'mysterious', 'all', 6, '/leaderboard', 1, true, 'it'),
('⚫ Punto di Non Ritorno', 'Ti avvicini al punto di non ritorno. Procedi con cautela.', 'mysterious', 'all', 8, '/map-3d-tiler', 1, true, 'it')
ON CONFLICT DO NOTHING;

-- === GAMEPLAY (20 IT) ===
INSERT INTO auto_push_templates (title, body, type, segment, weight, deeplink, freq_cap_user_per_day, enabled, lang) VALUES
('🏆 Movimento in Classifica!', 'Agente {agent_code}, la classifica si agita! Controlla la tua posizione.', 'gameplay', 'all', 15, '/leaderboard', 1, true, 'it'),
('🎁 Reward Nelle Vicinanze!', 'Agente, un Marker Reward è stato rilevato nella tua zona! Apri la mappa!', 'gameplay', 'all', 18, '/map-3d-tiler', 1, true, 'it'),
('🎯 Milestone Raggiunto!', 'Incredibile Agente {agent_code}! Stai scalando la missione!', 'gameplay', 'all', 15, '/home', 1, true, 'it'),
('⚠️ Streak in Pericolo!', 'Agente, non perdere il tuo streak! Fai almeno 1 azione oggi!', 'gameplay', 'all', 20, '/home', 1, true, 'it'),
('🎯 FINAL SHOOT Disponibile!', 'Agente {agent_code}, FINAL SHOOT è attivo! 3 tentativi per vincere!', 'gameplay', 'all', 20, '/map-3d-tiler', 1, true, 'it'),
('💡 Nuovo Indizio!', 'Un nuovo indizio è stato sbloccato! Controllalo subito!', 'gameplay', 'all', 15, '/buzz', 1, true, 'it'),
('🗺️ Esplora la Mappa!', 'La mappa nasconde segreti. Esplora nuove zone oggi!', 'gameplay', 'all', 12, '/map-3d-tiler', 1, true, 'it'),
('⚡ BUZZ Disponibile!', 'Hai M1U disponibili! Usali per sbloccare nuovi indizi!', 'gameplay', 'all', 15, '/buzz', 1, true, 'it'),
('🎮 Sfida Lanciata!', 'Una nuova sfida ti aspetta! Sei pronto ad accettarla?', 'gameplay', 'all', 12, '/map-3d-tiler', 1, true, 'it'),
('📍 Nuova Zona Sbloccata!', 'Una nuova zona è ora esplorabile! Cosa nasconde?', 'gameplay', 'all', 12, '/map-3d-tiler', 1, true, 'it'),
('🏅 Traguardo Vicino!', 'Sei a un passo dal prossimo traguardo! Non fermarti!', 'gameplay', 'all', 12, '/home', 1, true, 'it'),
('🔓 Livello Sbloccato!', 'Complimenti! Hai sbloccato un nuovo livello di accesso!', 'gameplay', 'all', 10, '/home', 1, true, 'it'),
('🎪 Evento Speciale!', 'Un evento speciale è in corso! Partecipa prima che finisca!', 'gameplay', 'all', 15, '/map-3d-tiler', 1, true, 'it'),
('💎 Bonus Giornaliero!', 'Il tuo bonus giornaliero ti aspetta! Reclamalo!', 'gameplay', 'all', 15, '/home', 1, true, 'it'),
('🎯 Missione Aggiornata!', 'La missione è stata aggiornata! Nuovi obiettivi disponibili!', 'gameplay', 'all', 12, '/home', 1, true, 'it'),
('🏆 Classifica Aggiornata!', 'La classifica è stata aggiornata! Controlla la tua posizione!', 'gameplay', 'all', 12, '/leaderboard', 1, true, 'it'),
('⚡ Power-Up Disponibile!', 'Un power-up è pronto per essere attivato! Usalo!', 'gameplay', 'all', 10, '/home', 1, true, 'it'),
('🎁 Reward Speciale!', 'Un reward speciale ti aspetta! Non lasciartelo sfuggire!', 'gameplay', 'all', 15, '/map-3d-tiler', 1, true, 'it'),
('📊 Statistiche Aggiornate!', 'Le tue statistiche sono state aggiornate! Vedi i progressi!', 'gameplay', 'all', 8, '/home', 1, true, 'it'),
('🌟 Achievement Sbloccato!', 'Hai sbloccato un nuovo achievement! Congratulazioni!', 'gameplay', 'all', 12, '/home', 1, true, 'it')
ON CONFLICT DO NOTHING;

-- === SOCIAL (10 IT) ===
INSERT INTO auto_push_templates (title, body, type, segment, weight, deeplink, freq_cap_user_per_day, enabled, lang) VALUES
('👥 Agente Nelle Vicinanze!', 'Un altro agente è stato avvistato nella tua zona! Sfidalo!', 'social', 'all', 12, '/map-3d-tiler', 1, true, 'it'),
('🔥 Rivale in Movimento!', 'Un tuo rivale in classifica sta giocando ora! Non restare indietro!', 'social', 'all', 15, '/leaderboard', 1, true, 'it'),
('🏆 Superato in Classifica!', 'Agente {agent_code}, qualcuno ti ha superato! Reagisci!', 'social', 'all', 18, '/leaderboard', 1, true, 'it'),
('👋 Amico Online!', 'Un tuo amico è online! Giocate insieme!', 'social', 'all', 10, '/map-3d-tiler', 1, true, 'it'),
('🔥 Zona Calda!', 'Molti agenti attivi nella tua zona! La competizione è accesa!', 'social', 'all', 12, '/map-3d-tiler', 1, true, 'it'),
('🎉 Invita Amici!', 'Invita i tuoi amici e guadagna bonus esclusivi!', 'social', 'all', 8, '/home', 1, true, 'it'),
('💬 Nuovo Messaggio!', 'Hai ricevuto un nuovo messaggio! Controllalo!', 'social', 'all', 15, '/notifications', 1, true, 'it'),
('🤝 Alleanza Proposta!', 'Un agente vuole allearsi con te! Accetti?', 'social', 'all', 10, '/notifications', 1, true, 'it'),
('📢 Annuncio Importante!', 'C''è un nuovo annuncio dalla centrale! Leggilo!', 'social', 'all', 12, '/notifications', 1, true, 'it'),
('🌍 Community Attiva!', 'La community è molto attiva oggi! Unisciti a loro!', 'social', 'all', 10, '/map-3d-tiler', 1, true, 'it')
ON CONFLICT DO NOTHING;

-- === ENGAGEMENT/SUMMARY (10 IT) ===
INSERT INTO auto_push_templates (title, body, type, segment, weight, deeplink, freq_cap_user_per_day, enabled, lang) VALUES
('📊 Report Settimanale', 'Agente {agent_code}: settimana completata! Controlla i tuoi progressi!', 'summary', 'all', 10, '/home', 1, true, 'it'),
('👋 Bentornato Agente!', 'Buongiorno {agent_code}! La missione ti aspetta!', 'morning', 'all', 12, '/home', 1, true, 'it'),
('🌅 Nuovo Giorno, Nuove Sfide!', 'Un nuovo giorno inizia! Quali sfide affronterai oggi?', 'morning', 'all', 10, '/home', 1, true, 'it'),
('🌙 Report Giornaliero', 'Ecco il tuo report di oggi! Come è andata?', 'summary', 'all', 8, '/home', 1, true, 'it'),
('📈 Progressi Notevoli!', 'I tuoi progressi questa settimana sono notevoli! Continua così!', 'summary', 'all', 10, '/home', 1, true, 'it'),
('🎯 Obiettivi Settimanali', 'Nuovi obiettivi settimanali disponibili! Accettali!', 'engagement', 'all', 12, '/home', 1, true, 'it'),
('⏰ Promemoria Missione', 'Non dimenticare la tua missione oggi, Agente!', 'engagement', 'all', 10, '/home', 1, true, 'it'),
('🔔 Attività in Sospeso', 'Hai attività in sospeso! Completale per bonus extra!', 'engagement', 'all', 12, '/home', 1, true, 'it'),
('📅 Programma Giornaliero', 'Ecco il tuo programma per oggi! Cosa farai prima?', 'engagement', 'all', 8, '/home', 1, true, 'it'),
('🎊 Fine Settimana!', 'È il weekend! Tempo perfetto per esplorare la mappa!', 'engagement', 'all', 10, '/map-3d-tiler', 1, true, 'it')
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. TEMPLATE INGLESI (100)
-- ============================================

-- === AION / ORACLE (15 EN) ===
INSERT INTO auto_push_templates (title, body, type, segment, weight, deeplink, freq_cap_user_per_day, enabled, lang) VALUES
('🔮 AION Daily Briefing', 'Agent {agent_code}, Energy Patterns reveal new information. The Oracle awaits you.', 'aion', 'all', 15, '/intelligence', 1, true, 'en'),
('⚡ AION has a Revelation', 'The coordinates of destiny are aligning, Agent. A truth awaits you in the shadows.', 'aion', 'all', 10, '/intelligence', 1, true, 'en'),
('🌀 The Oracle Seeks You', 'Agent {agent_code}, days have passed. AION has much to tell you. Come.', 'aion', 'inactive_24h', 12, '/intelligence', 1, true, 'en'),
('🔮 New Prophecy', 'A new prophecy has been deciphered. Only you can understand its meaning.', 'aion', 'all', 8, '/intelligence', 1, true, 'en'),
('⚡ Anomalous Energy Detected', 'AION has detected an anomaly. Consult the Oracle immediately.', 'aion', 'all', 10, '/intelligence', 1, true, 'en'),
('🌌 The Code Unveils', 'Agent, fragments of the M1SSION code are emerging. AION can guide you.', 'aion', 'all', 8, '/intelligence', 1, true, 'en'),
('🔮 Message from the Oracle', 'AION whispers your name, {agent_code}. There is something you must know.', 'aion', 'all', 10, '/intelligence', 1, true, 'en'),
('⚡ Synchronization Required', 'Your Energy Patterns need synchronization. AION awaits you.', 'aion', 'all', 8, '/intelligence', 1, true, 'en'),
('🌀 Vision Received', 'The Oracle had a vision concerning you. Do not ignore it.', 'aion', 'all', 10, '/intelligence', 1, true, 'en'),
('🔮 AION Requires Attention', 'Agent {agent_code}, AION has critical information for your mission.', 'aion', 'all', 12, '/intelligence', 1, true, 'en'),
('⚡ Unstable Frequency', 'Your frequency is unstable. AION can help stabilize it.', 'aion', 'all', 8, '/intelligence', 1, true, 'en'),
('🌌 Cosmic Connection', 'The stars align for you, Agent. AION translates their messages.', 'aion', 'all', 8, '/intelligence', 1, true, 'en'),
('🔮 Urgent from Oracle', 'AION intercepted an urgent message. It concerns your area.', 'aion', 'all', 12, '/intelligence', 1, true, 'en'),
('⚡ Quantum Awakening', 'Your quantum potential is emerging. AION can enhance it.', 'aion', 'all', 8, '/intelligence', 1, true, 'en'),
('🌀 The Oracle Never Sleeps', 'While you sleep, AION watches. Something important was discovered.', 'aion', 'all', 10, '/intelligence', 1, true, 'en')
ON CONFLICT DO NOTHING;

-- === MOTIVATIONAL (25 EN) ===
INSERT INTO auto_push_templates (title, body, type, segment, weight, deeplink, freq_cap_user_per_day, enabled, lang) VALUES
('🏃 You Were So Close!', 'Agent, yesterday you came so close to a Reward! Today you could win!', 'motivation', 'all', 12, '/map-3d-tiler', 1, true, 'en'),
('🎁 Prizes Found Today!', 'Today other agents found prizes on the map. Will you be next?', 'motivation', 'all', 12, '/map-3d-tiler', 1, true, 'en'),
('🌟 You Can Win!', 'Agent {agent_code}, explore the map, find clues with BUZZ. The final prize will be YOURS!', 'motivation', 'all', 15, '/map-3d-tiler', 1, true, 'en'),
('💪 The Agent Returns!', 'We missed you, Agent {agent_code}! The mission awaits. Get back in the game!', 'motivation', 'inactive_24h', 18, '/home', 1, true, 'en'),
('🔝 You Are Among the Best!', 'Agent, you are in an excellent position! One more push to the top!', 'motivation', 'all', 10, '/leaderboard', 1, true, 'en'),
('🚀 Today is the Right Day!', 'Agent {agent_code}, something tells me today will be special. Explore!', 'motivation', 'all', 12, '/map-3d-tiler', 1, true, 'en'),
('🎯 Goal in Sight!', 'You are closer than you think. Do not give up now!', 'motivation', 'all', 10, '/home', 1, true, 'en'),
('💎 The Prize Awaits You!', 'The final prize will not find itself. Move, Agent!', 'motivation', 'all', 12, '/map-3d-tiler', 1, true, 'en'),
('🔥 You Are Unstoppable!', 'Your dedication is impressive, {agent_code}. Keep it up!', 'motivation', 'all', 10, '/home', 1, true, 'en'),
('⭐ Stellar Agent!', 'Your performances are remarkable. You were born for this mission!', 'motivation', 'all', 8, '/home', 1, true, 'en'),
('🏆 Victory is Near!', 'Every BUZZ brings you closer to the prize. Do not stop!', 'motivation', 'all', 12, '/buzz', 1, true, 'en'),
('💫 Destined to Win!', 'Agent {agent_code}, you have all the cards. Play them well!', 'motivation', 'all', 10, '/map-3d-tiler', 1, true, 'en'),
('🎪 The Show Goes On!', 'The hunt is on! Do not just watch, participate!', 'motivation', 'all', 10, '/map-3d-tiler', 1, true, 'en'),
('⚡ Energy at Maximum!', 'Your energy levels are optimal. It is time to act!', 'motivation', 'all', 10, '/buzz', 1, true, 'en'),
('🌈 Unique Opportunity!', 'An opportunity like this does not come every day. Seize it!', 'motivation', 'all', 12, '/map-3d-tiler', 1, true, 'en'),
('🎖️ Elite Agent!', 'You are part of the elite, {agent_code}. Prove it on the field!', 'motivation', 'all', 8, '/map-3d-tiler', 1, true, 'en'),
('🚀 Ready for Takeoff!', 'Everything is ready. Only your action is missing. Take off!', 'motivation', 'all', 10, '/buzz', 1, true, 'en'),
('💥 Explode with Energy!', 'Release all your potential today. The map awaits you!', 'motivation', 'all', 10, '/map-3d-tiler', 1, true, 'en'),
('🎯 Aim High!', 'Do not settle, Agent. The biggest prize can be yours!', 'motivation', 'all', 12, '/home', 1, true, 'en'),
('🔥 Burn the Stages!', 'Accelerate, {agent_code}! Time is on your side today!', 'motivation', 'all', 10, '/map-3d-tiler', 1, true, 'en'),
('⭐ Magic Moment!', 'There is something special in the air. Take advantage of it!', 'motivation', 'all', 10, '/map-3d-tiler', 1, true, 'en'),
('🏅 Champion Coming!', 'Every champion starts with a first step. Take yours today!', 'motivation', 'all', 10, '/home', 1, true, 'en'),
('💪 Go Agent!', 'Give your best! The mission counts on you!', 'motivation', 'all', 12, '/map-3d-tiler', 1, true, 'en'),
('🌟 Shine Agent!', 'It is your time to shine, {agent_code}. Show what you are capable of!', 'motivation', 'all', 10, '/map-3d-tiler', 1, true, 'en'),
('🎁 Surprise Coming!', 'Today could have a surprise for you. Explore to discover it!', 'motivation', 'all', 12, '/map-3d-tiler', 1, true, 'en')
ON CONFLICT DO NOTHING;

-- === MYSTERIOUS (20 EN) ===
INSERT INTO auto_push_templates (title, body, type, segment, weight, deeplink, freq_cap_user_per_day, enabled, lang) VALUES
('📡 Signal Detected', 'An energy anomaly has been detected. Coordinates are aligning.', 'mysterious', 'all', 8, '/map-3d-tiler', 1, true, 'en'),
('🌀 Unusual Pattern', 'Data shows something strange in your area. Investigate, Agent.', 'mysterious', 'all', 8, '/map-3d-tiler', 1, true, 'en'),
('⏳ Time is Running', 'Something approaches. The countdown has begun. Are you ready?', 'mysterious', 'all', 10, '/home', 1, true, 'en'),
('✨ You Have Been Chosen', 'Agent {agent_code}, it is no coincidence you are here. Destiny has a plan.', 'mysterious', 'all', 8, '/intelligence', 1, true, 'en'),
('🔍 Closer Than You Think', 'Your recent actions... interesting. Continue on this path.', 'mysterious', 'all', 8, '/buzz', 1, true, 'en'),
('🌑 Shadows Moving', 'Something moves in the shadows. Be careful, Agent.', 'mysterious', 'all', 6, '/map-3d-tiler', 1, true, 'en'),
('🔮 Omen', 'An omen hovers over you. Positive or negative? Only you can decide.', 'mysterious', 'all', 6, '/intelligence', 1, true, 'en'),
('⚫ Dark Zone', 'A dark zone has been identified. Would you have the courage to explore it?', 'mysterious', 'all', 8, '/map-3d-tiler', 1, true, 'en'),
('🌌 Quantum Void', 'A quantum void has opened. What does it hide?', 'mysterious', 'all', 6, '/map-3d-tiler', 1, true, 'en'),
('🔐 Secret Code', 'A secret code has been intercepted. Can you decipher it?', 'mysterious', 'all', 8, '/intelligence', 1, true, 'en'),
('👁️ Eyes Everywhere', 'You are being watched, Agent. But by whom?', 'mysterious', 'all', 6, '/map-3d-tiler', 1, true, 'en'),
('🌙 Night Message', 'A message arrived while you slept. Check it.', 'mysterious', 'all', 8, '/intelligence', 1, true, 'en'),
('⚡ Interference', 'Interference on your frequency. Someone is trying to communicate.', 'mysterious', 'all', 8, '/intelligence', 1, true, 'en'),
('🗝️ Hidden Key', 'A hidden key has been revealed. What does it open?', 'mysterious', 'all', 8, '/map-3d-tiler', 1, true, 'en'),
('🌀 Time Vortex', 'A time vortex is forming. The moment is now.', 'mysterious', 'all', 6, '/map-3d-tiler', 1, true, 'en'),
('🔦 Light in Darkness', 'A light in the darkness shows the way. Follow it.', 'mysterious', 'all', 8, '/map-3d-tiler', 1, true, 'en'),
('📜 Ancient Message', 'An ancient message has been found. It speaks of you.', 'mysterious', 'all', 6, '/intelligence', 1, true, 'en'),
('🌑 Eclipse Approaching', 'An eclipse approaches. Great changes coming.', 'mysterious', 'all', 6, '/home', 1, true, 'en'),
('🔮 Intertwined Destiny', 'Your destiny intertwines with others. Who are they?', 'mysterious', 'all', 6, '/leaderboard', 1, true, 'en'),
('⚫ Point of No Return', 'You approach the point of no return. Proceed with caution.', 'mysterious', 'all', 8, '/map-3d-tiler', 1, true, 'en')
ON CONFLICT DO NOTHING;

-- === GAMEPLAY (20 EN) ===
INSERT INTO auto_push_templates (title, body, type, segment, weight, deeplink, freq_cap_user_per_day, enabled, lang) VALUES
('🏆 Leaderboard Movement!', 'Agent {agent_code}, the leaderboard is shaking! Check your position.', 'gameplay', 'all', 15, '/leaderboard', 1, true, 'en'),
('🎁 Reward Nearby!', 'Agent, a Reward Marker has been detected in your area! Open the map!', 'gameplay', 'all', 18, '/map-3d-tiler', 1, true, 'en'),
('🎯 Milestone Reached!', 'Incredible Agent {agent_code}! You are climbing the mission!', 'gameplay', 'all', 15, '/home', 1, true, 'en'),
('⚠️ Streak in Danger!', 'Agent, do not lose your streak! Do at least 1 action today!', 'gameplay', 'all', 20, '/home', 1, true, 'en'),
('🎯 FINAL SHOOT Available!', 'Agent {agent_code}, FINAL SHOOT is active! 3 attempts to win!', 'gameplay', 'all', 20, '/map-3d-tiler', 1, true, 'en'),
('💡 New Clue!', 'A new clue has been unlocked! Check it now!', 'gameplay', 'all', 15, '/buzz', 1, true, 'en'),
('🗺️ Explore the Map!', 'The map hides secrets. Explore new areas today!', 'gameplay', 'all', 12, '/map-3d-tiler', 1, true, 'en'),
('⚡ BUZZ Available!', 'You have M1U available! Use them to unlock new clues!', 'gameplay', 'all', 15, '/buzz', 1, true, 'en'),
('🎮 Challenge Launched!', 'A new challenge awaits you! Are you ready to accept it?', 'gameplay', 'all', 12, '/map-3d-tiler', 1, true, 'en'),
('📍 New Zone Unlocked!', 'A new zone is now explorable! What does it hide?', 'gameplay', 'all', 12, '/map-3d-tiler', 1, true, 'en'),
('🏅 Goal Nearby!', 'You are one step away from the next goal! Do not stop!', 'gameplay', 'all', 12, '/home', 1, true, 'en'),
('🔓 Level Unlocked!', 'Congratulations! You have unlocked a new access level!', 'gameplay', 'all', 10, '/home', 1, true, 'en'),
('🎪 Special Event!', 'A special event is ongoing! Participate before it ends!', 'gameplay', 'all', 15, '/map-3d-tiler', 1, true, 'en'),
('💎 Daily Bonus!', 'Your daily bonus awaits you! Claim it!', 'gameplay', 'all', 15, '/home', 1, true, 'en'),
('🎯 Mission Updated!', 'The mission has been updated! New objectives available!', 'gameplay', 'all', 12, '/home', 1, true, 'en'),
('🏆 Leaderboard Updated!', 'The leaderboard has been updated! Check your position!', 'gameplay', 'all', 12, '/leaderboard', 1, true, 'en'),
('⚡ Power-Up Available!', 'A power-up is ready to be activated! Use it!', 'gameplay', 'all', 10, '/home', 1, true, 'en'),
('🎁 Special Reward!', 'A special reward awaits you! Do not let it slip away!', 'gameplay', 'all', 15, '/map-3d-tiler', 1, true, 'en'),
('📊 Stats Updated!', 'Your statistics have been updated! See your progress!', 'gameplay', 'all', 8, '/home', 1, true, 'en'),
('🌟 Achievement Unlocked!', 'You have unlocked a new achievement! Congratulations!', 'gameplay', 'all', 12, '/home', 1, true, 'en')
ON CONFLICT DO NOTHING;

-- === SOCIAL (10 EN) ===
INSERT INTO auto_push_templates (title, body, type, segment, weight, deeplink, freq_cap_user_per_day, enabled, lang) VALUES
('👥 Agent Nearby!', 'Another agent has been spotted in your area! Challenge them!', 'social', 'all', 12, '/map-3d-tiler', 1, true, 'en'),
('🔥 Rival on the Move!', 'A rival in the leaderboard is playing now! Do not fall behind!', 'social', 'all', 15, '/leaderboard', 1, true, 'en'),
('🏆 Passed in Ranking!', 'Agent {agent_code}, someone passed you! React!', 'social', 'all', 18, '/leaderboard', 1, true, 'en'),
('👋 Friend Online!', 'A friend of yours is online! Play together!', 'social', 'all', 10, '/map-3d-tiler', 1, true, 'en'),
('🔥 Hot Zone!', 'Many active agents in your area! Competition is fierce!', 'social', 'all', 12, '/map-3d-tiler', 1, true, 'en'),
('🎉 Invite Friends!', 'Invite your friends and earn exclusive bonuses!', 'social', 'all', 8, '/home', 1, true, 'en'),
('💬 New Message!', 'You have received a new message! Check it!', 'social', 'all', 15, '/notifications', 1, true, 'en'),
('🤝 Alliance Proposed!', 'An agent wants to ally with you! Do you accept?', 'social', 'all', 10, '/notifications', 1, true, 'en'),
('📢 Important Announcement!', 'There is a new announcement from headquarters! Read it!', 'social', 'all', 12, '/notifications', 1, true, 'en'),
('🌍 Active Community!', 'The community is very active today! Join them!', 'social', 'all', 10, '/map-3d-tiler', 1, true, 'en')
ON CONFLICT DO NOTHING;

-- === ENGAGEMENT/SUMMARY (10 EN) ===
INSERT INTO auto_push_templates (title, body, type, segment, weight, deeplink, freq_cap_user_per_day, enabled, lang) VALUES
('📊 Weekly Report', 'Agent {agent_code}: week completed! Check your progress!', 'summary', 'all', 10, '/home', 1, true, 'en'),
('👋 Welcome Back Agent!', 'Good morning {agent_code}! The mission awaits you!', 'morning', 'all', 12, '/home', 1, true, 'en'),
('🌅 New Day, New Challenges!', 'A new day begins! What challenges will you face today?', 'morning', 'all', 10, '/home', 1, true, 'en'),
('🌙 Daily Report', 'Here is your report for today! How did it go?', 'summary', 'all', 8, '/home', 1, true, 'en'),
('📈 Remarkable Progress!', 'Your progress this week is remarkable! Keep it up!', 'summary', 'all', 10, '/home', 1, true, 'en'),
('🎯 Weekly Objectives', 'New weekly objectives available! Accept them!', 'engagement', 'all', 12, '/home', 1, true, 'en'),
('⏰ Mission Reminder', 'Do not forget your mission today, Agent!', 'engagement', 'all', 10, '/home', 1, true, 'en'),
('🔔 Pending Activities', 'You have pending activities! Complete them for extra bonuses!', 'engagement', 'all', 12, '/home', 1, true, 'en'),
('📅 Daily Schedule', 'Here is your schedule for today! What will you do first?', 'engagement', 'all', 8, '/home', 1, true, 'en'),
('🎊 Weekend Time!', 'It is the weekend! Perfect time to explore the map!', 'engagement', 'all', 10, '/map-3d-tiler', 1, true, 'en')
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICA CONTEGGIO
-- ============================================
DO $$
DECLARE
  it_count INTEGER;
  en_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO it_count FROM auto_push_templates WHERE lang = 'it';
  SELECT COUNT(*) INTO en_count FROM auto_push_templates WHERE lang = 'en';
  RAISE NOTICE '✅ Template IT: %, Template EN: %, TOTALE: %', it_count, en_count, it_count + en_count;
END $$;

-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™




