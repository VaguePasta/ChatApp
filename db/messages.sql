drop type messageType;
create type messageType as enum('text','image','video');

CREATE TABLE IF NOT EXISTS messages (
	message_id bigint NOT NULL PRIMARY KEY,
	channel_id int REFERENCES channels(channel_id) ON DELETE CASCADE ON UPDATE CASCADE,
	sender_id int REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
	type messageType,
	message text,
	deleted boolean DEFAULT false
)