-- ============================================================================
-- M1SSION™ COMPLETE WORLD GEOCODING
-- Funzione completa per riconoscere TUTTI i paesi del mondo
-- ORDINE CRITICO: Microstati → Zone confine → Paesi piccoli → Paesi grandi
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_country_code_from_coords(
  p_lat DOUBLE PRECISION,
  p_lng DOUBLE PRECISION
)
RETURNS CHAR(2)
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 1. MICROSTATI (controllare PRIMA di tutto - aree molto piccole)
  -- ═══════════════════════════════════════════════════════════════════════════
  
  -- MONACO (43.72-43.75, 7.40-7.44)
  IF p_lat BETWEEN 43.72 AND 43.75 AND p_lng BETWEEN 7.40 AND 7.44 THEN RETURN 'MC'; END IF;
  
  -- VATICANO (dentro Roma)
  IF p_lat BETWEEN 41.900 AND 41.908 AND p_lng BETWEEN 12.445 AND 12.458 THEN RETURN 'VA'; END IF;
  
  -- SAN MARINO (enclave in Italia)
  IF p_lat BETWEEN 43.89 AND 43.99 AND p_lng BETWEEN 12.40 AND 12.52 THEN RETURN 'SM'; END IF;
  
  -- LIECHTENSTEIN (tra Svizzera e Austria)
  IF p_lat BETWEEN 47.04 AND 47.27 AND p_lng BETWEEN 9.47 AND 9.64 THEN RETURN 'LI'; END IF;
  
  -- ANDORRA (tra Francia e Spagna)
  IF p_lat BETWEEN 42.43 AND 42.66 AND p_lng BETWEEN 1.41 AND 1.79 THEN RETURN 'AD'; END IF;
  
  -- MALTA
  IF p_lat BETWEEN 35.80 AND 36.08 AND p_lng BETWEEN 14.18 AND 14.58 THEN RETURN 'MT'; END IF;
  
  -- SINGAPORE
  IF p_lat BETWEEN 1.15 AND 1.47 AND p_lng BETWEEN 103.60 AND 104.05 THEN RETURN 'SG'; END IF;
  
  -- HONG KONG
  IF p_lat BETWEEN 22.15 AND 22.56 AND p_lng BETWEEN 113.83 AND 114.43 THEN RETURN 'HK'; END IF;
  
  -- MACAO
  IF p_lat BETWEEN 22.10 AND 22.22 AND p_lng BETWEEN 113.52 AND 113.60 THEN RETURN 'MO'; END IF;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 2. ZONE DI CONFINE CRITICHE (controllare PRIMA dei paesi grandi)
  -- ═══════════════════════════════════════════════════════════════════════════
  
  -- COSTA AZZURRA (Francia) - Nice, Cannes, Antibes - lng < 7.5
  IF p_lat BETWEEN 43.0 AND 44.5 AND p_lng BETWEEN 5.5 AND 7.49 THEN RETURN 'FR'; END IF;
  
  -- ALSAZIA (Francia) - confine con Germania - lng < 8.0
  IF p_lat BETWEEN 47.4 AND 49.1 AND p_lng BETWEEN 6.8 AND 8.0 THEN RETURN 'FR'; END IF;
  
  -- CORSICA (Francia) - isola
  IF p_lat BETWEEN 41.3 AND 43.1 AND p_lng BETWEEN 8.5 AND 9.6 THEN RETURN 'FR'; END IF;
  
  -- SARDEGNA (Italia)
  IF p_lat BETWEEN 38.8 AND 41.3 AND p_lng BETWEEN 8.1 AND 9.9 THEN RETURN 'IT'; END IF;
  
  -- SICILIA (Italia)
  IF p_lat BETWEEN 36.6 AND 38.3 AND p_lng BETWEEN 12.3 AND 15.7 THEN RETURN 'IT'; END IF;
  
  -- PAESI BASCHI (Spagna) - confine con Francia
  IF p_lat BETWEEN 42.5 AND 43.5 AND p_lng BETWEEN -3.5 AND -1.0 THEN RETURN 'ES'; END IF;
  
  -- CATALOGNA (Spagna) - confine con Francia
  IF p_lat BETWEEN 40.5 AND 42.9 AND p_lng BETWEEN 0.1 AND 3.4 THEN RETURN 'ES'; END IF;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 3. PAESI PICCOLI EUROPEI
  -- ═══════════════════════════════════════════════════════════════════════════
  
  -- LUSSEMBURGO
  IF p_lat BETWEEN 49.45 AND 50.18 AND p_lng BETWEEN 5.73 AND 6.53 THEN RETURN 'LU'; END IF;
  
  -- BELGIO
  IF p_lat BETWEEN 49.5 AND 51.5 AND p_lng BETWEEN 2.5 AND 6.4 THEN RETURN 'BE'; END IF;
  
  -- PAESI BASSI
  IF p_lat BETWEEN 50.75 AND 53.5 AND p_lng BETWEEN 3.36 AND 7.21 THEN RETURN 'NL'; END IF;
  
  -- SVIZZERA
  IF p_lat BETWEEN 45.8 AND 47.8 AND p_lng BETWEEN 5.9 AND 10.5 THEN RETURN 'CH'; END IF;
  
  -- BAVIERA/SUD GERMANIA (Monaco Bavaria: 48.13, 11.58 - PRIMA di Austria!)
  -- lng < 13.5 per escludere zona confine Austria
  IF p_lat BETWEEN 47.3 AND 50.6 AND p_lng BETWEEN 9.0 AND 13.5 THEN RETURN 'DE'; END IF;
  
  -- AUSTRIA (Vienna: 48.21, 16.37 - lng > 13.5)
  IF p_lat BETWEEN 46.4 AND 49.0 AND p_lng BETWEEN 9.5 AND 17.2 THEN RETURN 'AT'; END IF;
  
  -- SLOVENIA
  IF p_lat BETWEEN 45.4 AND 46.9 AND p_lng BETWEEN 13.4 AND 16.6 THEN RETURN 'SI'; END IF;
  
  -- CROAZIA
  IF p_lat BETWEEN 42.4 AND 46.6 AND p_lng BETWEEN 13.5 AND 19.4 THEN RETURN 'HR'; END IF;
  
  -- BOSNIA
  IF p_lat BETWEEN 42.5 AND 45.3 AND p_lng BETWEEN 15.7 AND 19.6 THEN RETURN 'BA'; END IF;
  
  -- SERBIA
  IF p_lat BETWEEN 42.2 AND 46.2 AND p_lng BETWEEN 18.8 AND 23.0 THEN RETURN 'RS'; END IF;
  
  -- MONTENEGRO
  IF p_lat BETWEEN 41.8 AND 43.6 AND p_lng BETWEEN 18.4 AND 20.4 THEN RETURN 'ME'; END IF;
  
  -- KOSOVO
  IF p_lat BETWEEN 41.8 AND 43.3 AND p_lng BETWEEN 20.0 AND 21.8 THEN RETURN 'XK'; END IF;
  
  -- ALBANIA
  IF p_lat BETWEEN 39.6 AND 42.7 AND p_lng BETWEEN 19.2 AND 21.1 THEN RETURN 'AL'; END IF;
  
  -- MACEDONIA DEL NORD
  IF p_lat BETWEEN 40.8 AND 42.4 AND p_lng BETWEEN 20.4 AND 23.0 THEN RETURN 'MK'; END IF;
  
  -- PORTOGALLO
  IF p_lat BETWEEN 36.9 AND 42.2 AND p_lng BETWEEN -9.5 AND -6.2 THEN RETURN 'PT'; END IF;
  
  -- IRLANDA
  IF p_lat BETWEEN 51.4 AND 55.4 AND p_lng BETWEEN -10.5 AND -6.0 THEN RETURN 'IE'; END IF;
  
  -- DANIMARCA
  IF p_lat BETWEEN 54.5 AND 57.8 AND p_lng BETWEEN 8.0 AND 15.2 THEN RETURN 'DK'; END IF;
  
  -- REPUBBLICA CECA
  IF p_lat BETWEEN 48.5 AND 51.1 AND p_lng BETWEEN 12.1 AND 18.9 THEN RETURN 'CZ'; END IF;
  
  -- SLOVACCHIA
  IF p_lat BETWEEN 47.7 AND 49.6 AND p_lng BETWEEN 16.8 AND 22.6 THEN RETURN 'SK'; END IF;
  
  -- UNGHERIA
  IF p_lat BETWEEN 45.7 AND 48.6 AND p_lng BETWEEN 16.1 AND 22.9 THEN RETURN 'HU'; END IF;
  
  -- GRECIA
  IF p_lat BETWEEN 34.8 AND 41.8 AND p_lng BETWEEN 19.3 AND 29.6 THEN RETURN 'GR'; END IF;
  
  -- BULGARIA
  IF p_lat BETWEEN 41.2 AND 44.2 AND p_lng BETWEEN 22.3 AND 28.6 THEN RETURN 'BG'; END IF;
  
  -- ROMANIA
  IF p_lat BETWEEN 43.6 AND 48.3 AND p_lng BETWEEN 20.2 AND 29.7 THEN RETURN 'RO'; END IF;
  
  -- CIPRO
  IF p_lat BETWEEN 34.5 AND 35.7 AND p_lng BETWEEN 32.2 AND 34.6 THEN RETURN 'CY'; END IF;
  
  -- ESTONIA
  IF p_lat BETWEEN 57.5 AND 59.7 AND p_lng BETWEEN 21.8 AND 28.2 THEN RETURN 'EE'; END IF;
  
  -- LETTONIA
  IF p_lat BETWEEN 55.7 AND 58.1 AND p_lng BETWEEN 20.9 AND 28.2 THEN RETURN 'LV'; END IF;
  
  -- LITUANIA
  IF p_lat BETWEEN 53.9 AND 56.5 AND p_lng BETWEEN 20.9 AND 26.8 THEN RETURN 'LT'; END IF;
  
  -- BIELORUSSIA
  IF p_lat BETWEEN 51.2 AND 56.2 AND p_lng BETWEEN 23.2 AND 32.8 THEN RETURN 'BY'; END IF;
  
  -- UCRAINA
  IF p_lat BETWEEN 44.4 AND 52.4 AND p_lng BETWEEN 22.1 AND 40.2 THEN RETURN 'UA'; END IF;
  
  -- MOLDAVIA
  IF p_lat BETWEEN 45.5 AND 48.5 AND p_lng BETWEEN 26.6 AND 30.2 THEN RETURN 'MD'; END IF;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 4. PAESI EUROPEI GRANDI
  -- ═══════════════════════════════════════════════════════════════════════════
  
  -- ITALIA (lng inizia da 7.5 - esclude Costa Azzurra)
  IF p_lat BETWEEN 35.5 AND 47.1 AND p_lng BETWEEN 7.5 AND 18.5 THEN RETURN 'IT'; END IF;
  
  -- FRANCIA (mainland)
  IF p_lat BETWEEN 41.3 AND 51.1 AND p_lng BETWEEN -5.1 AND 9.6 THEN RETURN 'FR'; END IF;
  
  -- GERMANIA
  IF p_lat BETWEEN 47.3 AND 55.1 AND p_lng BETWEEN 5.9 AND 15.0 THEN RETURN 'DE'; END IF;
  
  -- SPAGNA
  IF p_lat BETWEEN 36.0 AND 43.8 AND p_lng BETWEEN -9.3 AND 4.3 THEN RETURN 'ES'; END IF;
  
  -- REGNO UNITO
  IF p_lat BETWEEN 49.9 AND 60.9 AND p_lng BETWEEN -8.2 AND 1.8 THEN RETURN 'GB'; END IF;
  
  -- POLONIA
  IF p_lat BETWEEN 49.0 AND 54.8 AND p_lng BETWEEN 14.1 AND 24.1 THEN RETURN 'PL'; END IF;
  
  -- SVEZIA
  IF p_lat BETWEEN 55.3 AND 69.1 AND p_lng BETWEEN 10.9 AND 24.2 THEN RETURN 'SE'; END IF;
  
  -- NORVEGIA
  IF p_lat BETWEEN 57.9 AND 71.2 AND p_lng BETWEEN 4.5 AND 31.1 THEN RETURN 'NO'; END IF;
  
  -- FINLANDIA
  IF p_lat BETWEEN 59.8 AND 70.1 AND p_lng BETWEEN 20.6 AND 31.6 THEN RETURN 'FI'; END IF;
  
  -- ISLANDA
  IF p_lat BETWEEN 63.3 AND 66.5 AND p_lng BETWEEN -24.5 AND -13.5 THEN RETURN 'IS'; END IF;
  
  -- TURCHIA
  IF p_lat BETWEEN 35.8 AND 42.1 AND p_lng BETWEEN 25.7 AND 44.8 THEN RETURN 'TR'; END IF;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 5. RUSSIA (enorme - check dopo Europa)
  -- ═══════════════════════════════════════════════════════════════════════════
  IF p_lat BETWEEN 41.2 AND 82.0 AND p_lng BETWEEN 19.6 AND 180.0 THEN RETURN 'RU'; END IF;
  IF p_lat BETWEEN 41.2 AND 82.0 AND p_lng BETWEEN -180.0 AND -169.0 THEN RETURN 'RU'; END IF; -- Kamchatka
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 6. AMERICHE
  -- ═══════════════════════════════════════════════════════════════════════════
  
  -- CANADA
  IF p_lat BETWEEN 41.7 AND 83.1 AND p_lng BETWEEN -141.0 AND -52.6 THEN RETURN 'CA'; END IF;
  
  -- USA (continental)
  IF p_lat BETWEEN 24.5 AND 49.4 AND p_lng BETWEEN -125.0 AND -66.9 THEN RETURN 'US'; END IF;
  
  -- ALASKA (USA)
  IF p_lat BETWEEN 51.2 AND 71.4 AND p_lng BETWEEN -180.0 AND -129.9 THEN RETURN 'US'; END IF;
  
  -- HAWAII (USA)
  IF p_lat BETWEEN 18.9 AND 22.3 AND p_lng BETWEEN -160.3 AND -154.8 THEN RETURN 'US'; END IF;
  
  -- MESSICO
  IF p_lat BETWEEN 14.5 AND 32.7 AND p_lng BETWEEN -118.4 AND -86.7 THEN RETURN 'MX'; END IF;
  
  -- GUATEMALA
  IF p_lat BETWEEN 13.7 AND 17.8 AND p_lng BETWEEN -92.2 AND -88.2 THEN RETURN 'GT'; END IF;
  
  -- BELIZE
  IF p_lat BETWEEN 15.9 AND 18.5 AND p_lng BETWEEN -89.2 AND -87.5 THEN RETURN 'BZ'; END IF;
  
  -- HONDURAS
  IF p_lat BETWEEN 12.9 AND 16.5 AND p_lng BETWEEN -89.4 AND -83.1 THEN RETURN 'HN'; END IF;
  
  -- EL SALVADOR
  IF p_lat BETWEEN 13.2 AND 14.5 AND p_lng BETWEEN -90.1 AND -87.7 THEN RETURN 'SV'; END IF;
  
  -- NICARAGUA
  IF p_lat BETWEEN 10.7 AND 15.0 AND p_lng BETWEEN -87.7 AND -82.7 THEN RETURN 'NI'; END IF;
  
  -- COSTA RICA
  IF p_lat BETWEEN 8.0 AND 11.2 AND p_lng BETWEEN -85.9 AND -82.5 THEN RETURN 'CR'; END IF;
  
  -- PANAMA
  IF p_lat BETWEEN 7.2 AND 9.6 AND p_lng BETWEEN -83.0 AND -77.2 THEN RETURN 'PA'; END IF;
  
  -- CUBA
  IF p_lat BETWEEN 19.8 AND 23.3 AND p_lng BETWEEN -85.0 AND -74.1 THEN RETURN 'CU'; END IF;
  
  -- REPUBBLICA DOMINICANA
  IF p_lat BETWEEN 17.5 AND 19.9 AND p_lng BETWEEN -72.0 AND -68.3 THEN RETURN 'DO'; END IF;
  
  -- HAITI
  IF p_lat BETWEEN 18.0 AND 20.1 AND p_lng BETWEEN -74.5 AND -71.6 THEN RETURN 'HT'; END IF;
  
  -- JAMAICA
  IF p_lat BETWEEN 17.7 AND 18.5 AND p_lng BETWEEN -78.4 AND -76.2 THEN RETURN 'JM'; END IF;
  
  -- PUERTO RICO (USA)
  IF p_lat BETWEEN 17.9 AND 18.5 AND p_lng BETWEEN -67.3 AND -65.2 THEN RETURN 'PR'; END IF;
  
  -- COLOMBIA
  IF p_lat BETWEEN -4.2 AND 12.5 AND p_lng BETWEEN -79.0 AND -66.9 THEN RETURN 'CO'; END IF;
  
  -- VENEZUELA
  IF p_lat BETWEEN 0.6 AND 12.2 AND p_lng BETWEEN -73.4 AND -59.8 THEN RETURN 'VE'; END IF;
  
  -- ECUADOR
  IF p_lat BETWEEN -5.0 AND 1.5 AND p_lng BETWEEN -81.1 AND -75.2 THEN RETURN 'EC'; END IF;
  
  -- PERU
  IF p_lat BETWEEN -18.4 AND -0.04 AND p_lng BETWEEN -81.3 AND -68.7 THEN RETURN 'PE'; END IF;
  
  -- BOLIVIA
  IF p_lat BETWEEN -22.9 AND -9.7 AND p_lng BETWEEN -69.6 AND -57.5 THEN RETURN 'BO'; END IF;
  
  -- CILE
  IF p_lat BETWEEN -56.0 AND -17.5 AND p_lng BETWEEN -75.6 AND -66.4 THEN RETURN 'CL'; END IF;
  
  -- ARGENTINA
  IF p_lat BETWEEN -55.1 AND -21.8 AND p_lng BETWEEN -73.6 AND -53.6 THEN RETURN 'AR'; END IF;
  
  -- URUGUAY
  IF p_lat BETWEEN -35.0 AND -30.1 AND p_lng BETWEEN -58.4 AND -53.1 THEN RETURN 'UY'; END IF;
  
  -- PARAGUAY
  IF p_lat BETWEEN -27.6 AND -19.3 AND p_lng BETWEEN -62.6 AND -54.3 THEN RETURN 'PY'; END IF;
  
  -- BRASILE
  IF p_lat BETWEEN -33.8 AND 5.3 AND p_lng BETWEEN -73.9 AND -34.8 THEN RETURN 'BR'; END IF;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 7. ASIA (ORDINE: paesi piccoli PRIMA di quelli grandi!)
  -- ═══════════════════════════════════════════════════════════════════════════
  
  -- COREA DEL SUD (PRIMA di Giappone! Seoul: 37.57, 126.98)
  IF p_lat BETWEEN 33.1 AND 38.6 AND p_lng BETWEEN 124.6 AND 131.9 THEN RETURN 'KR'; END IF;
  
  -- COREA DEL NORD
  IF p_lat BETWEEN 37.7 AND 43.0 AND p_lng BETWEEN 124.2 AND 130.7 THEN RETURN 'KP'; END IF;
  
  -- GIAPPONE (dopo Coree!)
  IF p_lat BETWEEN 24.0 AND 46.0 AND p_lng BETWEEN 123.0 AND 146.0 THEN RETURN 'JP'; END IF;
  
  -- TAIWAN
  IF p_lat BETWEEN 21.9 AND 25.3 AND p_lng BETWEEN 120.0 AND 122.0 THEN RETURN 'TW'; END IF;
  
  -- FILIPPINE
  IF p_lat BETWEEN 4.6 AND 21.1 AND p_lng BETWEEN 116.9 AND 126.6 THEN RETURN 'PH'; END IF;
  
  -- VIETNAM
  IF p_lat BETWEEN 8.4 AND 23.4 AND p_lng BETWEEN 102.1 AND 109.5 THEN RETURN 'VN'; END IF;
  
  -- THAILANDIA
  IF p_lat BETWEEN 5.6 AND 20.5 AND p_lng BETWEEN 97.3 AND 105.6 THEN RETURN 'TH'; END IF;
  
  -- MALAYSIA (peninsulare)
  IF p_lat BETWEEN 1.2 AND 6.7 AND p_lng BETWEEN 99.6 AND 104.5 THEN RETURN 'MY'; END IF;
  
  -- INDONESIA
  IF p_lat BETWEEN -11.0 AND 6.1 AND p_lng BETWEEN 95.0 AND 141.0 THEN RETURN 'ID'; END IF;
  
  -- INDIA
  IF p_lat BETWEEN 6.7 AND 35.5 AND p_lng BETWEEN 68.1 AND 97.4 THEN RETURN 'IN'; END IF;
  
  -- PAKISTAN
  IF p_lat BETWEEN 23.7 AND 37.1 AND p_lng BETWEEN 60.9 AND 77.8 THEN RETURN 'PK'; END IF;
  
  -- BANGLADESH
  IF p_lat BETWEEN 20.7 AND 26.6 AND p_lng BETWEEN 88.0 AND 92.7 THEN RETURN 'BD'; END IF;
  
  -- NEPAL
  IF p_lat BETWEEN 26.4 AND 30.4 AND p_lng BETWEEN 80.1 AND 88.2 THEN RETURN 'NP'; END IF;
  
  -- SRI LANKA
  IF p_lat BETWEEN 5.9 AND 9.8 AND p_lng BETWEEN 79.7 AND 81.9 THEN RETURN 'LK'; END IF;
  
  -- MYANMAR
  IF p_lat BETWEEN 9.8 AND 28.5 AND p_lng BETWEEN 92.2 AND 101.2 THEN RETURN 'MM'; END IF;
  
  -- CINA
  IF p_lat BETWEEN 18.0 AND 54.0 AND p_lng BETWEEN 73.0 AND 135.0 THEN RETURN 'CN'; END IF;
  
  -- MONGOLIA
  IF p_lat BETWEEN 41.6 AND 52.1 AND p_lng BETWEEN 87.8 AND 119.9 THEN RETURN 'MN'; END IF;
  
  -- KAZAKISTAN
  IF p_lat BETWEEN 40.6 AND 55.4 AND p_lng BETWEEN 46.5 AND 87.3 THEN RETURN 'KZ'; END IF;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 8. MEDIO ORIENTE (ORDINE: paesi piccoli PRIMA di quelli grandi!)
  -- ═══════════════════════════════════════════════════════════════════════════
  
  -- ISRAELE
  IF p_lat BETWEEN 29.5 AND 33.3 AND p_lng BETWEEN 34.2 AND 35.9 THEN RETURN 'IL'; END IF;
  
  -- LIBANO
  IF p_lat BETWEEN 33.1 AND 34.7 AND p_lng BETWEEN 35.1 AND 36.6 THEN RETURN 'LB'; END IF;
  
  -- GIORDANIA
  IF p_lat BETWEEN 29.2 AND 33.4 AND p_lng BETWEEN 34.9 AND 39.3 THEN RETURN 'JO'; END IF;
  
  -- QATAR (piccolo, prima!)
  IF p_lat BETWEEN 24.5 AND 26.2 AND p_lng BETWEEN 50.7 AND 51.7 THEN RETURN 'QA'; END IF;
  
  -- KUWAIT (piccolo, prima!)
  IF p_lat BETWEEN 28.5 AND 30.1 AND p_lng BETWEEN 46.5 AND 48.4 THEN RETURN 'KW'; END IF;
  
  -- EMIRATI ARABI (Dubai: 25.2, 55.3 - PRIMA di Iran!)
  IF p_lat BETWEEN 22.6 AND 26.1 AND p_lng BETWEEN 51.5 AND 56.4 THEN RETURN 'AE'; END IF;
  
  -- OMAN
  IF p_lat BETWEEN 16.6 AND 26.4 AND p_lng BETWEEN 52.0 AND 59.8 THEN RETURN 'OM'; END IF;
  
  -- SIRIA
  IF p_lat BETWEEN 32.3 AND 37.3 AND p_lng BETWEEN 35.7 AND 42.4 THEN RETURN 'SY'; END IF;
  
  -- IRAQ
  IF p_lat BETWEEN 29.1 AND 37.4 AND p_lng BETWEEN 38.8 AND 48.6 THEN RETURN 'IQ'; END IF;
  
  -- ARABIA SAUDITA (grande, dopo i piccoli!)
  IF p_lat BETWEEN 16.4 AND 32.2 AND p_lng BETWEEN 34.5 AND 55.7 THEN RETURN 'SA'; END IF;
  
  -- IRAN (grande, dopo i piccoli!)
  IF p_lat BETWEEN 25.1 AND 39.8 AND p_lng BETWEEN 44.0 AND 63.3 THEN RETURN 'IR'; END IF;
  
  -- YEMEN
  IF p_lat BETWEEN 12.1 AND 19.0 AND p_lng BETWEEN 42.5 AND 54.5 THEN RETURN 'YE'; END IF;
  
  -- AFGHANISTAN
  IF p_lat BETWEEN 29.4 AND 38.5 AND p_lng BETWEEN 60.5 AND 74.9 THEN RETURN 'AF'; END IF;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 9. AFRICA
  -- ═══════════════════════════════════════════════════════════════════════════
  
  -- MAROCCO
  IF p_lat BETWEEN 27.7 AND 35.9 AND p_lng BETWEEN -13.2 AND -1.0 THEN RETURN 'MA'; END IF;
  
  -- ALGERIA
  IF p_lat BETWEEN 18.9 AND 37.1 AND p_lng BETWEEN -8.7 AND 12.0 THEN RETURN 'DZ'; END IF;
  
  -- TUNISIA
  IF p_lat BETWEEN 30.2 AND 37.5 AND p_lng BETWEEN 7.5 AND 11.6 THEN RETURN 'TN'; END IF;
  
  -- LIBIA
  IF p_lat BETWEEN 19.5 AND 33.2 AND p_lng BETWEEN 9.4 AND 25.2 THEN RETURN 'LY'; END IF;
  
  -- EGITTO
  IF p_lat BETWEEN 22.0 AND 31.7 AND p_lng BETWEEN 24.7 AND 36.9 THEN RETURN 'EG'; END IF;
  
  -- SUDAFRICA
  IF p_lat BETWEEN -35.0 AND -22.1 AND p_lng BETWEEN 16.5 AND 32.9 THEN RETURN 'ZA'; END IF;
  
  -- NIGERIA
  IF p_lat BETWEEN 4.3 AND 13.9 AND p_lng BETWEEN 2.7 AND 14.7 THEN RETURN 'NG'; END IF;
  
  -- KENYA
  IF p_lat BETWEEN -4.7 AND 4.6 AND p_lng BETWEEN 33.9 AND 41.9 THEN RETURN 'KE'; END IF;
  
  -- ETIOPIA
  IF p_lat BETWEEN 3.4 AND 14.9 AND p_lng BETWEEN 33.0 AND 48.0 THEN RETURN 'ET'; END IF;
  
  -- TANZANIA
  IF p_lat BETWEEN -11.7 AND -1.0 AND p_lng BETWEEN 29.3 AND 40.4 THEN RETURN 'TZ'; END IF;
  
  -- GHANA
  IF p_lat BETWEEN 4.7 AND 11.2 AND p_lng BETWEEN -3.3 AND 1.2 THEN RETURN 'GH'; END IF;
  
  -- SENEGAL
  IF p_lat BETWEEN 12.3 AND 16.7 AND p_lng BETWEEN -17.5 AND -11.4 THEN RETURN 'SN'; END IF;
  
  -- COSTA D'AVORIO
  IF p_lat BETWEEN 4.4 AND 10.7 AND p_lng BETWEEN -8.6 AND -2.5 THEN RETURN 'CI'; END IF;
  
  -- CAMERUN
  IF p_lat BETWEEN 1.7 AND 13.1 AND p_lng BETWEEN 8.5 AND 16.2 THEN RETURN 'CM'; END IF;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- 10. OCEANIA
  -- ═══════════════════════════════════════════════════════════════════════════
  
  -- AUSTRALIA
  IF p_lat BETWEEN -44.0 AND -10.0 AND p_lng BETWEEN 113.0 AND 154.0 THEN RETURN 'AU'; END IF;
  
  -- NUOVA ZELANDA
  IF p_lat BETWEEN -47.3 AND -34.4 AND p_lng BETWEEN 166.4 AND 178.6 THEN RETURN 'NZ'; END IF;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- DEFAULT: Sconosciuto
  -- ═══════════════════════════════════════════════════════════════════════════
  RETURN 'XX';
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- TEST COMPLETO - TUTTE LE CITTÀ PRINCIPALI
-- ═══════════════════════════════════════════════════════════════════════════
SELECT city, country_code, expected, 
  CASE WHEN country_code = expected THEN '✅' ELSE '❌ ERRORE!' END AS status
FROM (
  VALUES
    -- EUROPA
    ('Roma', get_country_code_from_coords(41.9028, 12.4964), 'IT'),
    ('Milano', get_country_code_from_coords(45.4642, 9.1900), 'IT'),
    ('Venezia', get_country_code_from_coords(45.4408, 12.3155), 'IT'),
    ('Napoli', get_country_code_from_coords(40.8518, 14.2681), 'IT'),
    ('Parigi', get_country_code_from_coords(48.8566, 2.3522), 'FR'),
    ('Nice', get_country_code_from_coords(43.7102, 7.2620), 'FR'),
    ('Cannes', get_country_code_from_coords(43.5528, 7.0174), 'FR'),
    ('Marsiglia', get_country_code_from_coords(43.2965, 5.3698), 'FR'),
    ('Lione', get_country_code_from_coords(45.7640, 4.8357), 'FR'),
    ('Monaco', get_country_code_from_coords(43.7384, 7.4246), 'MC'),
    ('Berlino', get_country_code_from_coords(52.5200, 13.4050), 'DE'),
    ('Monaco Bavaria', get_country_code_from_coords(48.1351, 11.5820), 'DE'),
    ('Madrid', get_country_code_from_coords(40.4168, -3.7038), 'ES'),
    ('Barcellona', get_country_code_from_coords(41.3851, 2.1734), 'ES'),
    ('Londra', get_country_code_from_coords(51.5074, -0.1278), 'GB'),
    ('Amsterdam', get_country_code_from_coords(52.3676, 4.9041), 'NL'),
    ('Bruxelles', get_country_code_from_coords(50.8503, 4.3517), 'BE'),
    ('Vienna', get_country_code_from_coords(48.2082, 16.3738), 'AT'),
    ('Zurigo', get_country_code_from_coords(47.3769, 8.5417), 'CH'),
    ('Lisbona', get_country_code_from_coords(38.7223, -9.1393), 'PT'),
    ('Atene', get_country_code_from_coords(37.9838, 23.7275), 'GR'),
    -- AMERICHE
    ('New York', get_country_code_from_coords(40.7128, -74.0060), 'US'),
    ('Los Angeles', get_country_code_from_coords(34.0522, -118.2437), 'US'),
    ('Toronto', get_country_code_from_coords(43.6532, -79.3832), 'CA'),
    ('Città del Messico', get_country_code_from_coords(19.4326, -99.1332), 'MX'),
    ('San Paolo', get_country_code_from_coords(-23.5505, -46.6333), 'BR'),
    ('Rio de Janeiro', get_country_code_from_coords(-22.9068, -43.1729), 'BR'),
    ('Buenos Aires', get_country_code_from_coords(-34.6037, -58.3816), 'AR'),
    -- ASIA
    ('Tokyo', get_country_code_from_coords(35.6762, 139.6503), 'JP'),
    ('Pechino', get_country_code_from_coords(39.9042, 116.4074), 'CN'),
    ('Shanghai', get_country_code_from_coords(31.2304, 121.4737), 'CN'),
    ('Hong Kong', get_country_code_from_coords(22.3193, 114.1694), 'HK'),
    ('Singapore', get_country_code_from_coords(1.3521, 103.8198), 'SG'),
    ('Dubai', get_country_code_from_coords(25.2048, 55.2708), 'AE'),
    ('Mumbai', get_country_code_from_coords(19.0760, 72.8777), 'IN'),
    ('Seoul', get_country_code_from_coords(37.5665, 126.9780), 'KR'),
    -- AFRICA/OCEANIA
    ('Cairo', get_country_code_from_coords(30.0444, 31.2357), 'EG'),
    ('Johannesburg', get_country_code_from_coords(-26.2041, 28.0473), 'ZA'),
    ('Sydney', get_country_code_from_coords(-33.8688, 151.2093), 'AU'),
    ('Melbourne', get_country_code_from_coords(-37.8136, 144.9631), 'AU')
) AS t(city, country_code, expected)
ORDER BY status DESC, city;

