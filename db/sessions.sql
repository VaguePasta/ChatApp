CREATE TABLE IF NOT EXISTS sessions (
	user_id int REFERENCES users(user_id),
	session_key TEXT NOT NULL PRIMARY KEY
)