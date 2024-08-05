create table if not exists invite_code(
	channel_id int references channels(channel_id) on delete cascade primary key,
	code text
)