-- ============================================================================
-- M1SSION™ FIX: Costa Azzurra (Nice, Cannes) riconosciuta come Francia
-- PROBLEMA: Costa Azzurra (lng 5.5-7.5) veniva assegnata a Italia invece di Francia
-- © 2025 Joseph MULÉ – M1SSION™ – ALL RIGHTS RESERVED – NIYVORA KFT™
-- ============================================================================

-- Fix: Aggiungere check specifico per COSTA AZZURRA prima dell'Italia
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
  -- ORDINE CRITICO: Microstati e zone di confine PRIMA dei paesi grandi!
  -- ═══════════════════════════════════════════════════════════════════════════
  
  -- MONACO (microstato - PRIMA di tutto!)
  IF p_lat BETWEEN 43.72 AND 43.75 AND p_lng BETWEEN 7.40 AND 7.44 THEN RETURN 'MC'; END IF;
  
  -- ═══════════════════════════════════════════════════════════════════════════
  -- ZONA CONFINE FRANCIA-ITALIA (COSTA AZZURRA) - CHECK PRIMA DELL'ITALIA!
  -- La Costa Azzurra è in Francia ma lng 6.6-7.5 si sovrappone con Italia
  -- Confine reale FR-IT: circa lng 7.5 (Mentone/Ventimiglia)
  -- ═══════════════════════════════════════════════════════════════════════════
  -- Nice: 43.7, 7.26 | Cannes: 43.55, 7.01 | Antibes: 43.58, 7.12
  -- Mentone (confine): 43.77, 7.50
  IF p_lat BETWEEN 43.0 AND 44.5 AND p_lng BETWEEN 5.5 AND 7.49 THEN RETURN 'FR'; END IF;
  
  -- SAN MARINO (microstato)
  IF p_lat BETWEEN 43.89 AND 43.99 AND p_lng BETWEEN 12.40 AND 12.52 THEN RETURN 'SM'; END IF;
  
  -- VATICANO (microstato)
  IF p_lat BETWEEN 41.90 AND 41.91 AND p_lng BETWEEN 12.45 AND 12.46 THEN RETURN 'VA'; END IF;
  
  -- LUSSEMBURGO
  IF p_lat BETWEEN 49.45 AND 50.18 AND p_lng BETWEEN 5.73 AND 6.53 THEN RETURN 'LU'; END IF;
  
  -- BELGIO
  IF p_lat BETWEEN 49.5 AND 51.5 AND p_lng BETWEEN 2.5 AND 6.4 THEN RETURN 'BE'; END IF;
  
  -- PAESI BASSI
  IF p_lat BETWEEN 50.75 AND 53.5 AND p_lng BETWEEN 3.36 AND 7.21 THEN RETURN 'NL'; END IF;
  
  -- SVIZZERA
  IF p_lat BETWEEN 45.8 AND 47.8 AND p_lng BETWEEN 5.9 AND 10.5 THEN RETURN 'CH'; END IF;
  
  -- AUSTRIA
  IF p_lat BETWEEN 46.4 AND 49.0 AND p_lng BETWEEN 9.5 AND 17.2 THEN RETURN 'AT'; END IF;
  
  -- PORTOGALLO
  IF p_lat BETWEEN 36.9 AND 42.2 AND p_lng BETWEEN -9.5 AND -6.2 THEN RETURN 'PT'; END IF;
  
  -- GRECIA
  IF p_lat BETWEEN 34.8 AND 41.8 AND p_lng BETWEEN 19.3 AND 29.6 THEN RETURN 'GR'; END IF;
  
  -- POLONIA
  IF p_lat BETWEEN 49.0 AND 54.8 AND p_lng BETWEEN 14.1 AND 24.1 THEN RETURN 'PL'; END IF;
  
  -- ITALIA (lng inizia da 7.5 per escludere Costa Azzurra!)
  IF p_lat BETWEEN 35.5 AND 47.1 AND p_lng BETWEEN 7.5 AND 18.5 THEN RETURN 'IT'; END IF;
  
  -- FRANCIA (resto del paese)
  IF p_lat BETWEEN 41.3 AND 51.1 AND p_lng BETWEEN -5.1 AND 9.6 THEN RETURN 'FR'; END IF;
  
  -- GERMANIA
  IF p_lat BETWEEN 47.3 AND 55.1 AND p_lng BETWEEN 5.9 AND 15.0 THEN RETURN 'DE'; END IF;
  
  -- SPAGNA
  IF p_lat BETWEEN 36.0 AND 43.8 AND p_lng BETWEEN -9.3 AND 3.3 THEN RETURN 'ES'; END IF;
  
  -- REGNO UNITO
  IF p_lat BETWEEN 49.9 AND 60.9 AND p_lng BETWEEN -8.2 AND 1.8 THEN RETURN 'GB'; END IF;
  
  -- USA (continental)
  IF p_lat BETWEEN 24.5 AND 49.4 AND p_lng BETWEEN -125.0 AND -66.9 THEN RETURN 'US'; END IF;
  
  -- BRASILE
  IF p_lat BETWEEN -33.8 AND 5.3 AND p_lng BETWEEN -73.9 AND -34.8 THEN RETURN 'BR'; END IF;
  
  -- GIAPPONE
  IF p_lat BETWEEN 24.0 AND 46.0 AND p_lng BETWEEN 123.0 AND 146.0 THEN RETURN 'JP'; END IF;
  
  -- CINA
  IF p_lat BETWEEN 18.0 AND 54.0 AND p_lng BETWEEN 73.0 AND 135.0 THEN RETURN 'CN'; END IF;
  
  -- AUSTRALIA
  IF p_lat BETWEEN -44.0 AND -10.0 AND p_lng BETWEEN 113.0 AND 154.0 THEN RETURN 'AU'; END IF;
  
  -- INDIA
  IF p_lat BETWEEN 6.7 AND 35.5 AND p_lng BETWEEN 68.1 AND 97.4 THEN RETURN 'IN'; END IF;
  
  -- RUSSIA (parte europea)
  IF p_lat BETWEEN 41.2 AND 82.0 AND p_lng BETWEEN 19.6 AND 180.0 THEN RETURN 'RU'; END IF;
  
  -- CANADA
  IF p_lat BETWEEN 41.7 AND 83.1 AND p_lng BETWEEN -141.0 AND -52.6 THEN RETURN 'CA'; END IF;
  
  -- MESSICO
  IF p_lat BETWEEN 14.5 AND 32.7 AND p_lng BETWEEN -118.4 AND -86.7 THEN RETURN 'MX'; END IF;
  
  -- ARGENTINA
  IF p_lat BETWEEN -55.1 AND -21.8 AND p_lng BETWEEN -73.6 AND -53.6 THEN RETURN 'AR'; END IF;
  
  -- SUDAFRICA
  IF p_lat BETWEEN -35.0 AND -22.1 AND p_lng BETWEEN 16.5 AND 32.9 THEN RETURN 'ZA'; END IF;
  
  -- EGITTO
  IF p_lat BETWEEN 22.0 AND 31.7 AND p_lng BETWEEN 24.7 AND 36.9 THEN RETURN 'EG'; END IF;
  
  -- Default: Unknown
  RETURN 'XX';
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- TEST: Verifica che Costa Azzurra sia riconosciuta come Francia
-- ═══════════════════════════════════════════════════════════════════════════
SELECT 
  'Parigi' AS city, get_country_code_from_coords(48.8566, 2.3522) AS country,
  CASE WHEN get_country_code_from_coords(48.8566, 2.3522) = 'FR' THEN '✅' ELSE '❌' END AS status
UNION ALL
SELECT 'Nice', get_country_code_from_coords(43.7102, 7.2620), 
  CASE WHEN get_country_code_from_coords(43.7102, 7.2620) = 'FR' THEN '✅' ELSE '❌' END
UNION ALL
SELECT 'Cannes', get_country_code_from_coords(43.5528, 7.0174),
  CASE WHEN get_country_code_from_coords(43.5528, 7.0174) = 'FR' THEN '✅' ELSE '❌' END
UNION ALL
SELECT 'Monaco', get_country_code_from_coords(43.7384, 7.4246),
  CASE WHEN get_country_code_from_coords(43.7384, 7.4246) = 'MC' THEN '✅' ELSE '❌' END
UNION ALL
SELECT 'Roma', get_country_code_from_coords(41.9028, 12.4964),
  CASE WHEN get_country_code_from_coords(41.9028, 12.4964) = 'IT' THEN '✅' ELSE '❌' END
UNION ALL
SELECT 'Ventimiglia', get_country_code_from_coords(43.7917, 7.6083),
  CASE WHEN get_country_code_from_coords(43.7917, 7.6083) = 'IT' THEN '✅' ELSE '❌' END;

