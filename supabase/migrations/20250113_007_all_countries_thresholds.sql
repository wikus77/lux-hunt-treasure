-- ============================================================================
-- M1SSION WAR — Soglie Conquista per TUTTI i Paesi del Mondo
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- 
-- Soglie basate su:
-- - Grandezza geografica
-- - Popolazione
-- - Importanza strategica
--
-- CATEGORIE:
-- - 30: Superpotenze (USA, Cina, Russia, India, Brasile)
-- - 25: Potenze maggiori (Germania, Francia, UK, Giappone)
-- - 21: Paesi grandi (Italia, Spagna, Polonia, Canada)
-- - 18: Paesi medi-grandi (Messico, Argentina, Australia)
-- - 15: Paesi medi (Olanda, Belgio, Grecia, Portogallo)
-- - 12: Paesi piccoli (Svizzera, Austria, Irlanda)
-- - 10: Paesi molto piccoli (Lussemburgo, Slovenia, Estonia)
-- - 8:  Microstati (Monaco, San Marino, Liechtenstein)
-- ============================================================================

-- Inserisci/Aggiorna tutti i paesi
INSERT INTO public.country_domination (country_code, conquest_threshold) VALUES
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- EUROPA (50 paesi)
  -- ═══════════════════════════════════════════════════════════════════════════
  
  -- Grandi potenze europee (25)
  ('DE', 25),  -- Germania
  ('FR', 25),  -- Francia
  ('GB', 25),  -- Regno Unito
  
  -- Paesi grandi (21)
  ('IT', 21),  -- Italia
  ('ES', 21),  -- Spagna
  ('PL', 21),  -- Polonia
  ('UA', 21),  -- Ucraina
  ('RO', 21),  -- Romania
  
  -- Paesi medi-grandi (18)
  ('NL', 18),  -- Paesi Bassi
  ('BE', 18),  -- Belgio
  ('GR', 18),  -- Grecia
  ('CZ', 18),  -- Repubblica Ceca
  ('PT', 18),  -- Portogallo
  ('SE', 18),  -- Svezia
  ('HU', 18),  -- Ungheria
  
  -- Paesi medi (15)
  ('AT', 15),  -- Austria
  ('CH', 15),  -- Svizzera
  ('BG', 15),  -- Bulgaria
  ('DK', 15),  -- Danimarca
  ('FI', 15),  -- Finlandia
  ('SK', 15),  -- Slovacchia
  ('NO', 15),  -- Norvegia
  ('IE', 15),  -- Irlanda
  ('HR', 15),  -- Croazia
  ('RS', 15),  -- Serbia
  ('BA', 15),  -- Bosnia
  ('AL', 15),  -- Albania
  ('LT', 15),  -- Lituania
  
  -- Paesi piccoli (12)
  ('SI', 12),  -- Slovenia
  ('LV', 12),  -- Lettonia
  ('EE', 12),  -- Estonia
  ('CY', 12),  -- Cipro
  ('MK', 12),  -- Macedonia del Nord
  ('ME', 12),  -- Montenegro
  ('IS', 12),  -- Islanda
  ('MT', 12),  -- Malta
  ('BY', 12),  -- Bielorussia
  ('MD', 12),  -- Moldavia
  ('XK', 12),  -- Kosovo
  
  -- Microstati (8-10)
  ('LU', 10),  -- Lussemburgo
  ('AD', 8),   -- Andorra
  ('MC', 8),   -- Monaco
  ('SM', 8),   -- San Marino
  ('VA', 8),   -- Vaticano
  ('LI', 8),   -- Liechtenstein
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- ASIA (50 paesi)
  -- ═══════════════════════════════════════════════════════════════════════════
  
  -- Superpotenze (30)
  ('CN', 30),  -- Cina
  ('IN', 30),  -- India
  ('RU', 30),  -- Russia
  
  -- Potenze maggiori (25)
  ('JP', 25),  -- Giappone
  ('KR', 25),  -- Corea del Sud
  ('ID', 25),  -- Indonesia
  ('TR', 25),  -- Turchia
  
  -- Paesi grandi (21)
  ('SA', 21),  -- Arabia Saudita
  ('IR', 21),  -- Iran
  ('PK', 21),  -- Pakistan
  ('TH', 21),  -- Thailandia
  ('VN', 21),  -- Vietnam
  ('MY', 21),  -- Malaysia
  ('PH', 21),  -- Filippine
  ('IQ', 21),  -- Iraq
  
  -- Paesi medi-grandi (18)
  ('AE', 18),  -- Emirati Arabi
  ('IL', 18),  -- Israele
  ('SG', 18),  -- Singapore
  ('BD', 18),  -- Bangladesh
  ('MM', 18),  -- Myanmar
  ('AF', 18),  -- Afghanistan
  ('UZ', 18),  -- Uzbekistan
  ('KZ', 18),  -- Kazakistan
  
  -- Paesi medi (15)
  ('KW', 15),  -- Kuwait
  ('QA', 15),  -- Qatar
  ('OM', 15),  -- Oman
  ('JO', 15),  -- Giordania
  ('LB', 15),  -- Libano
  ('SY', 15),  -- Siria
  ('YE', 15),  -- Yemen
  ('NP', 15),  -- Nepal
  ('LK', 15),  -- Sri Lanka
  ('KH', 15),  -- Cambogia
  ('LA', 15),  -- Laos
  ('AZ', 15),  -- Azerbaijan
  ('GE', 15),  -- Georgia
  ('AM', 15),  -- Armenia
  ('KG', 15),  -- Kirghizistan
  ('TJ', 15),  -- Tagikistan
  ('TM', 15),  -- Turkmenistan
  ('MN', 15),  -- Mongolia
  
  -- Paesi piccoli (12)
  ('BH', 12),  -- Bahrain
  ('KP', 12),  -- Corea del Nord
  ('BT', 12),  -- Bhutan
  ('MV', 12),  -- Maldive
  ('TL', 12),  -- Timor Est
  ('BN', 12),  -- Brunei
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- NORD AMERICA (3 paesi + Caraibi)
  -- ═══════════════════════════════════════════════════════════════════════════
  
  -- Superpotenze (30)
  ('US', 30),  -- Stati Uniti
  
  -- Paesi grandi (21)
  ('CA', 21),  -- Canada
  ('MX', 21),  -- Messico
  
  -- Caraibi e Centro America (12-15)
  ('CU', 15),  -- Cuba
  ('DO', 15),  -- Repubblica Dominicana
  ('HT', 15),  -- Haiti
  ('JM', 12),  -- Giamaica
  ('TT', 12),  -- Trinidad e Tobago
  ('BS', 12),  -- Bahamas
  ('BB', 10),  -- Barbados
  ('GT', 15),  -- Guatemala
  ('HN', 15),  -- Honduras
  ('SV', 15),  -- El Salvador
  ('NI', 15),  -- Nicaragua
  ('CR', 15),  -- Costa Rica
  ('PA', 15),  -- Panama
  ('BZ', 10),  -- Belize
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- SUD AMERICA (13 paesi)
  -- ═══════════════════════════════════════════════════════════════════════════
  
  -- Superpotenze (30)
  ('BR', 30),  -- Brasile
  
  -- Paesi grandi (21)
  ('AR', 21),  -- Argentina
  ('CO', 21),  -- Colombia
  ('VE', 21),  -- Venezuela
  
  -- Paesi medi-grandi (18)
  ('PE', 18),  -- Perù
  ('CL', 18),  -- Cile
  ('EC', 18),  -- Ecuador
  
  -- Paesi medi (15)
  ('BO', 15),  -- Bolivia
  ('PY', 15),  -- Paraguay
  ('UY', 15),  -- Uruguay
  ('GY', 12),  -- Guyana
  ('SR', 12),  -- Suriname
  ('GF', 10),  -- Guyana Francese
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- AFRICA (54 paesi)
  -- ═══════════════════════════════════════════════════════════════════════════
  
  -- Paesi grandi (21)
  ('EG', 21),  -- Egitto
  ('NG', 21),  -- Nigeria
  ('ZA', 21),  -- Sudafrica
  ('DZ', 21),  -- Algeria
  ('ET', 21),  -- Etiopia
  ('CD', 21),  -- Congo (RDC)
  
  -- Paesi medi-grandi (18)
  ('MA', 18),  -- Marocco
  ('KE', 18),  -- Kenya
  ('TZ', 18),  -- Tanzania
  ('UG', 18),  -- Uganda
  ('GH', 18),  -- Ghana
  ('CI', 18),  -- Costa d'Avorio
  ('CM', 18),  -- Camerun
  ('AO', 18),  -- Angola
  ('MZ', 18),  -- Mozambico
  ('SD', 18),  -- Sudan
  
  -- Paesi medi (15)
  ('SN', 15),  -- Senegal
  ('ZM', 15),  -- Zambia
  ('ZW', 15),  -- Zimbabwe
  ('TN', 15),  -- Tunisia
  ('LY', 15),  -- Libia
  ('MG', 15),  -- Madagascar
  ('ML', 15),  -- Mali
  ('NE', 15),  -- Niger
  ('BF', 15),  -- Burkina Faso
  ('RW', 15),  -- Ruanda
  ('SO', 15),  -- Somalia
  ('MW', 15),  -- Malawi
  
  -- Paesi piccoli (12)
  ('MU', 12),  -- Mauritius
  ('BW', 12),  -- Botswana
  ('NA', 12),  -- Namibia
  ('GA', 12),  -- Gabon
  ('LS', 12),  -- Lesotho
  ('SZ', 12),  -- Eswatini
  ('GM', 12),  -- Gambia
  ('GW', 12),  -- Guinea-Bissau
  ('GN', 12),  -- Guinea
  ('SL', 12),  -- Sierra Leone
  ('LR', 12),  -- Liberia
  ('TG', 12),  -- Togo
  ('BJ', 12),  -- Benin
  ('MR', 12),  -- Mauritania
  ('CG', 12),  -- Congo
  ('CF', 12),  -- Centrafrica
  ('TD', 12),  -- Ciad
  ('ER', 12),  -- Eritrea
  ('DJ', 12),  -- Gibuti
  ('SS', 12),  -- Sud Sudan
  ('BI', 12),  -- Burundi
  
  -- Microstati (10)
  ('CV', 10),  -- Capo Verde
  ('ST', 10),  -- São Tomé e Príncipe
  ('SC', 10),  -- Seychelles
  ('KM', 10),  -- Comore
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- OCEANIA (14 paesi)
  -- ═══════════════════════════════════════════════════════════════════════════
  
  -- Paesi grandi (21)
  ('AU', 21),  -- Australia
  
  -- Paesi medi (15)
  ('NZ', 15),  -- Nuova Zelanda
  ('PG', 15),  -- Papua Nuova Guinea
  
  -- Paesi piccoli (12)
  ('FJ', 12),  -- Fiji
  ('SB', 12),  -- Isole Salomone
  ('VU', 12),  -- Vanuatu
  ('WS', 12),  -- Samoa
  ('NC', 12),  -- Nuova Caledonia
  
  -- Microstati (8-10)
  ('TO', 10),  -- Tonga
  ('FM', 10),  -- Micronesia
  ('KI', 10),  -- Kiribati
  ('MH', 10),  -- Isole Marshall
  ('PW', 10),  -- Palau
  ('NR', 8),   -- Nauru
  ('TV', 8)    -- Tuvalu

ON CONFLICT (country_code) DO UPDATE SET
  conquest_threshold = EXCLUDED.conquest_threshold;

-- ============================================================================
-- Verifica totale paesi inseriti
-- ============================================================================

SELECT 
  COUNT(*) as total_countries,
  MIN(conquest_threshold) as min_threshold,
  MAX(conquest_threshold) as max_threshold,
  AVG(conquest_threshold)::INTEGER as avg_threshold
FROM country_domination;

-- ============================================================================
-- ✅ SETUP COMPLETATO!
-- ============================================================================

