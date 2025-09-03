-- Create unique index to prevent duplicates
CREATE UNIQUE INDEX IF NOT EXISTS ux_push_subscriptions_endpoint 
ON push_subscriptions(endpoint);

-- Create function to set endpoint_type automatically
CREATE OR REPLACE FUNCTION set_push_endpoint_type() 
RETURNS trigger AS $$
BEGIN
  IF NEW.endpoint LIKE 'https://web.push.apple.com/%' THEN 
    NEW.endpoint_type := 'apns';
  ELSIF NEW.endpoint LIKE 'https://fcm.googleapis.com/%' OR NEW.endpoint LIKE 'https://fcm.googleapis.com/wp/%' THEN 
    NEW.endpoint_type := 'fcm';
  ELSE 
    NEW.endpoint_type := COALESCE(NEW.endpoint_type, 'unknown');
  END IF;
  RETURN NEW;
END; 
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set endpoint_type
DROP TRIGGER IF EXISTS trg_set_push_endpoint_type ON push_subscriptions;
CREATE TRIGGER trg_set_push_endpoint_type 
  BEFORE INSERT OR UPDATE ON push_subscriptions 
  FOR EACH ROW 
  EXECUTE FUNCTION set_push_endpoint_type();