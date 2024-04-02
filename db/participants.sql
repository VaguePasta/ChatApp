CREATE TYPE privileges AS ENUM('admin','member','viewer');
CREATE TABLE participants (
	user_id int REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
	channel_id int REFERENCES channels(channel_id) ON DELETE CASCADE ON UPDATE CASCADE,
	privilege privileges
)