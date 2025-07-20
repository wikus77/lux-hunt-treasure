-- Fix calculate_direction function - modulo operator error
CREATE OR REPLACE FUNCTION public.calculate_direction(lat1 double precision, lng1 double precision, lat2 double precision, lng2 double precision)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
  dlng DOUBLE PRECISION;
  y DOUBLE PRECISION;
  x DOUBLE PRECISION;
  bearing DOUBLE PRECISION;
  directions TEXT[] := ARRAY['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
BEGIN
  dlng := radians(lng2 - lng1);
  y := sin(dlng) * cos(radians(lat2));
  x := cos(radians(lat1)) * sin(radians(lat2)) - sin(radians(lat1)) * cos(radians(lat2)) * cos(dlng);
  bearing := degrees(atan2(y, x));
  bearing := bearing + 360;
  bearing := bearing - 360 * floor(bearing / 360); -- Fix: use floor division instead of modulo
  RETURN directions[floor((bearing + 22.5) / 45)::int % 8 + 1];
END;
$function$;