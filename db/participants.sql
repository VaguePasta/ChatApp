DO $$ 
BEGIN
    CREATE TYPE privileges AS ENUM('admin','member','viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS participants (
	user_id int REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
	channel_id int REFERENCES channels(channel_id) ON DELETE CASCADE ON UPDATE CASCADE,
	privilege privileges
)