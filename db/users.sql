CREATE TABLE IF NOT EXISTS users (
	username text NOT NULL UNIQUE,
	password text NOT NULL,
	user_id int NOT NULL UNIQUE GENERATED ALWAYS AS IDENTITY,
	register_at date NOT NULL,
	primary key(username, user_id)
)