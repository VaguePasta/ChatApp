package system

import (
	"ChatApp/internal/db"
	"ChatApp/internal/websocket"
	"context"
	"github.com/gorilla/mux"
	"net/http"
)

func LogIn(w http.ResponseWriter, r *http.Request) {
	origin := r.Header.Get("Origin")
	w.Header().Set("Access-Control-Allow-Origin", origin)
	err := r.ParseForm()
	if err != nil {
		return
	}
	credentials := db.CheckCredentials(r.Form["username"][0], r.Form["password"][0])
	if credentials == "" {
		w.WriteHeader(401)
	} else {
		w.Header().Set("Content-Type", "text/plain")
		w.WriteHeader(200)
		_, err := w.Write([]byte(credentials))
		if err != nil {
			return
		}
	}
}
func ServeWs(pool *websocket.Pool, w http.ResponseWriter, r *http.Request) {
	token := mux.Vars(r)["token"]
	userid := db.CheckToken(token)
	if userid == -1 {
		return
	}
	var username string
	err := db.DatabaseConn.QueryRow(context.Background(), "update users set is_active = true where user_id = $1 returning username", userid).Scan(&username)
	if err != nil {
		return
	}
	conn, err := websocket.Upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	client := &websocket.Client{
		ID:    userid,
		Name:  username,
		Token: token,
		Conn:  conn,
		Pool:  pool,
	}
	client.Register(pool)
	client.Read()
}
