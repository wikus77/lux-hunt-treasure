
-- Create a function for executing SQL commands securely
CREATE OR REPLACE FUNCTION public.execute_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;

-- Grant permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.execute_sql(text) TO authenticated;

-- Helper function to get the current timestamp
CREATE OR REPLACE FUNCTION public.now()
RETURNS timestamp with time zone
LANGUAGE sql
STABLE
AS $$
  SELECT now();
$$;

-- Grant permissions 
GRANT EXECUTE ON FUNCTION public.now() TO authenticated;
