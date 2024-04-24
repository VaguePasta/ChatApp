package system

import (
	"ChatApp/internal/chat"
	"ChatApp/internal/websocket"
	"context"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"github.com/gorilla/mux"
	"golang.org/x/crypto/bcrypt"
	"net/http"
)

func LogIn(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	err := r.ParseForm()
	if err != nil {
		return
	}
	credentials := CheckCredentials(r.Form["username"][0], r.Form["password"][0])
	if credentials == "" {
		w.WriteHeader(401)
	} else {
		w.Header().Set("Content-Type", "text/plain")
		_, err := w.Write([]byte(credentials))
		if err != nil {
			return
		}
	}
}
func CheckCredentials(username string, password string) string {
	var userid, _username, _password string
	err := chat.DatabaseConn.QueryRow(context.Background(), "select user_id, username, password from users where username=$1", username).Scan(&userid, &_username, &_password)
	if err != nil {
		fmt.Println(err)
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
	_, err = chat.DatabaseConn.Exec(context.Background(), "insert into sessions (user_id, session_key) VALUES ($1,$2)", userid, token)
	if err != nil {
		return ""
	}
	return userid + "/" + token
}
func CheckToken(token string) int {
	var userid int
	err := chat.DatabaseConn.QueryRow(context.Background(), "select user_id from sessions where session_key=$1", token).Scan(&userid)
	if err != nil {
		return -1
	}
	return userid
}
func ServeWs(pool *websocket.Pool, w http.ResponseWriter, r *http.Request) {
	token := mux.Vars(r)["token"]
	userid := CheckToken(token)
	if userid == -1 {
		return
	}
	_, err := chat.DatabaseConn.Exec(context.Background(), "update users set is_active = true where user_id = $1", userid)
	if err != nil {
		return
	}
	conn, err := websocket.Upgrade(w, r)
	if err != nil {
		fmt.Println(err)
		return
	}
	client := &websocket.Client{
		ID:    userid,
		Token: token,
		Conn:  conn,
		Pool:  pool,
	}
	client.Register(pool)
	client.Read()
}
