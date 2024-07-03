create table replies (
	reply_to bigint references messages(message_id),
	reply bigint references messages(message_id) on delete cascade on update cascade,
	primary key (reply, reply_to)
)
