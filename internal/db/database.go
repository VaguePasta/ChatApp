package db

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/sony/sonyflake"
	"golang.org/x/crypto/bcrypt"
)

var Setting sonyflake.Settings
var IdGenerator *sonyflake.Sonyflake
var DatabaseConn *pgxpool.Pool

func CheckCredentials(username string, password string) string {
	var userid, _username, _password string
	err := DatabaseConn.QueryRow(context.Background(), "select user_id, username, password from users where username=$1", username).Scan(&userid, &_username, &_password)
	if err != nil {
		return ""
	}
	err = bcrypt.CompareHashAndPassword([]byte(_password), []byte(password))
	if err != nil {
		return ""
	}
	b := make([]byte, 8)
	if _, err := rand.Read(b); err != nil {
		return ""
	}
	token := hex.EncodeToString(b)
	_, err = DatabaseConn.Exec(context.Background(), "insert into sessions (user_id, session_key) VALUES ($1,$2)", userid, token)
	if err != nil {
		return ""
	}
	return userid + "/" + token
}
func CheckToken(token string) int {
	var userid int
	err := DatabaseConn.QueryRow(context.Background(), "select user_id from sessions where session_key=$1", token).Scan(&userid)
	if err != nil {
		return -1
	}
	return userid
}
