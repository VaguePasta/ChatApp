CREATE TABLE IF NOT EXISTS users (
	username text NOT NULL,
	password text NOT NULL,
	user_id int NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	register_at date NOT NULL
)