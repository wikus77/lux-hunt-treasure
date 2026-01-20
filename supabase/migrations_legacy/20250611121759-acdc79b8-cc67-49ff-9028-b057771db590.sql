
-- Delete records in correct order to avoid foreign key constraint violations
-- Start with dependent tables first, then auth.users last

DELETE FROM weekly_buzz_allowances WHERE user_id = '6c789e77-a58a-4135-b9ed-2d96ec4f7849';
DELETE FROM user_buzz_counter WHERE user_id = '6c789e77-a58a-4135-b9ed-2d96ec4f7849';
DELETE FROM user_buzz_map_counter WHERE user_id = '6c789e77-a58a-4135-b9ed-2d96ec4f7849';
DELETE FROM user_clues WHERE user_id = '6c789e77-a58a-4135-b9ed-2d96ec4f7849';
DELETE FROM user_map_areas WHERE user_id = '6c789e77-a58a-4135-b9ed-2d96ec4f7849';
DELETE FROM user_notifications WHERE user_id = '6c789e77-a58a-4135-b9ed-2d96ec4f7849';
DELETE FROM search_areas WHERE user_id = '6c789e77-a58a-4135-b9ed-2d96ec4f7849';
DELETE FROM map_points WHERE user_id = '6c789e77-a58a-4135-b9ed-2d96ec4f7849';
DELETE FROM subscriptions WHERE user_id = '6c789e77-a58a-4135-b9ed-2d96ec4f7849';
DELETE FROM payment_transactions WHERE user_id = '6c789e77-a58a-4135-b9ed-2d96ec4f7849';
DELETE FROM user_payment_methods WHERE user_id = '6c789e77-a58a-4135-b9ed-2d96ec4f7849';
DELETE FROM user_minigames_progress WHERE user_id = '6c789e77-a58a-4135-b9ed-2d96ec4f7849';
DELETE FROM user_buzz_bonuses WHERE user_id = '6c789e77-a58a-4135-b9ed-2d96ec4f7849';
DELETE FROM buzz_logs WHERE user_id = '6c789e77-a58a-4135-b9ed-2d96ec4f7849';
DELETE FROM buzz_generation_logs WHERE user_id = '6c789e77-a58a-4135-b9ed-2d96ec4f7849';
DELETE FROM buzz_map_actions WHERE user_id = '6c789e77-a58a-4135-b9ed-2d96ec4f7849';
DELETE FROM live_activity_state WHERE user_id = '6c789e77-a58a-4135-b9ed-2d96ec4f7849';
DELETE FROM device_tokens WHERE user_id = '6c789e77-a58a-4135-b9ed-2d96ec4f7849';

-- Clean up profile data
DELETE FROM profiles WHERE email = 'wikus77@hotmail.it' OR id = '6c789e77-a58a-4135-b9ed-2d96ec4f7849';

-- Finally delete the user from auth.users (this must be last)
DELETE FROM auth.users WHERE email = 'wikus77@hotmail.it';
