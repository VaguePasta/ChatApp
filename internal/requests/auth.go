package requests

import (
	"ChatApp/internal/system"
	"context"
	"crypto/rand"
	"encoding/hex"
	"golang.org/x/crypto/bcrypt"
	"log"
	"net/http"
)

func CheckToken(token string) uint {
	client, exists := system.ConnectionPool.Clients.Get(token)
	if !exists {
		return 0
	}
	return client.ID
}
func Authorize(w http.ResponseWriter, r *http.Request) bool {
	w.Header().Set("Access-Control-Allow-Origin", r.Header.Get("Origin"))
	w.Header().Set("Access-Control-Allow-Credentials", "true")
	if CheckToken(r.Header.Get("Authorization")) == 0 {
		return false
	}
	return true
}
func CheckPassword(userid uint, password string) (bool, string) {
	var _password string
	err := system.DatabaseConn.QueryRow(context.Background(), "select password from users where user_id = $1", userid).Scan(&_password)
	if err != nil {
		return false, _password
	}
	err = bcrypt.CompareHashAndPassword([]byte(_password), []byte(password))
	if err != nil {
		return false, _password
	}
	return true, _password
}
func CheckCredentials(username string, password string) string {
	var userid, _username, _password string
	err := system.DatabaseConn.QueryRow(context.Background(), "select user_id, username, password from users where username=$1", username).Scan(&userid, &_username, &_password)
	if err != nil {
		log.Println(err)
		return ""
	}
	err = bcrypt.CompareHashAndPassword([]byte(_password), []byte(password))
	if err != nil {
		return ""
	}
	b := make([]byte, 12)
	if _, err := rand.Read(b); err != nil {
		return ""
	}
	token := hex.EncodeToString(b)
	_, err = system.DatabaseConn.Exec(context.Background(), "insert into sessions (user_id, session_key) VALUES ($1,$2)", userid, token)
	if err != nil {
		log.Println(err)
		return ""
	}
	return userid + "/" + token
}
