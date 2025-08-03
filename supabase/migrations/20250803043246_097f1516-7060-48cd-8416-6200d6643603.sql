-- Insert test device tokens for push notification debugging
-- Using the actual user ID from auth.users

DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get the admin user ID
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'wikus77@hotmail.it' LIMIT 1;
    
    IF admin_user_id IS NOT NULL THEN
        -- Insert test tokens for the admin user
        INSERT INTO device_tokens (user_id, token, device_type, last_used) VALUES
        (
            admin_user_id,
            '{"endpoint":"https://fcm.googleapis.com/fcm/send/test-admin-endpoint","keys":{"p256dh":"test-admin-p256dh-key","auth":"test-admin-auth-key"}}',
            'web_push',
            now()
        );
        
        RAISE NOTICE 'Inserted test token for admin user: %', admin_user_id;
    ELSE
        RAISE NOTICE 'Admin user not found!';
    END IF;
    
    -- Create a dummy test user for additional testing
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        recovery_sent_at,
        last_sign_in_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        'test-push@example.com',
        crypt('password123', gen_salt('bf')),
        now(),
        now(),
        now(),
        '{"provider":"email","providers":["email"]}',
        '{"test_user": true}',
        now(),
        now(),
        '',
        '',
        '',
        ''
    );
    
    -- Get the test user and add a token
    INSERT INTO device_tokens (user_id, token, device_type, last_used)
    SELECT 
        id,
        '{"endpoint":"https://fcm.googleapis.com/fcm/send/test-user-endpoint","keys":{"p256dh":"test-user-p256dh-key","auth":"test-user-auth-key"}}',
        'web_push',
        now()
    FROM auth.users WHERE email = 'test-push@example.com';
    
END $$;

-- Verify tokens were inserted
SELECT 
    dt.id,
    u.email,
    dt.device_type,
    dt.created_at
FROM device_tokens dt
JOIN auth.users u ON dt.user_id = u.id
ORDER BY dt.created_at DESC;