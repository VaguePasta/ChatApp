create table if not exists replies (
	reply_to bigint default 0 references messages(message_id) on delete set default,
	reply bigint references messages(message_id) on delete cascade on update cascade primary key
)
