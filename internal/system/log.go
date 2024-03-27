package system

import (
	"ChatApp/internal/websocket"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"github.com/gorilla/mux"
	"net/http"
)

func LogIn(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	err := r.ParseForm()
	if err != nil {
		return
	}
	credentials := CheckCredentials(r.Form["username"][0], r.Form["password"][0])
	if credentials == "0" {
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
	b := make([]byte, 8)
	if _, err := rand.Read(b); err != nil {
		return ""
	}
	return hex.EncodeToString(b)
}
func CheckToken(token string) bool {
	return true
}
func ServeWs(pool *websocket.Pool, w http.ResponseWriter, r *http.Request) {
	token := mux.Vars(r)["token"]
	fmt.Println("Token: ", token)
	if !CheckToken(token) {
		return
	}
	conn, err := websocket.Upgrade(w, r)
	if err != nil {
		fmt.Println(err)
		return
	}
	client := &websocket.Client{
		Conn: conn,
		Pool: pool,
	}
	client.Register(pool)
	fmt.Println("A new user connected.")
	client.Read()
}
