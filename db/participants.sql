DROP TYPE privileges;
CREATE TYPE privileges AS ENUM('admin','moderator','member','viewer');

CREATE TABLE IF NOT EXISTS participants (
	user_id int REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
	channel_id int REFERENCES channels(channel_id) ON DELETE CASCADE ON UPDATE CASCADE,
	primary key (channel_id, user_id),
	privilege privileges
)