CREATE TABLE users (
	username text NOT NULL,
	password text NOT NULL,
	user_id int NOT NULL PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
	is_active boolean,
	register_at date
)