CREATE TABLE IF NOT EXISTS users (
	username text NOT NULL,
	password text NOT NULL,
	user_id int NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	is_active boolean NOT NULL DEFAULT false,
	register_at date NOT NULL
)