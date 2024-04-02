CREATE TABLE channels (
	channel_id int NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	title text,
	create_date date
)