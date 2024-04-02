CREATE TABLE messages (
	message_id bigint NOT NULL PRIMARY KEY,
	channel_id int REFERENCES channels(channel_id) ON DELETE CASCADE ON UPDATE CASCADE,
	sender_id int REFERENCES users(user_id) ON DELETE CASCADE ON UPDATE CASCADE,
	message text,
	deleted boolean DEFAULT false
)