package system

import (
	"ChatApp/internal/db"
	"ChatApp/internal/websocket"
	"context"
	"github.com/gorilla/mux"
	"net/http"
)

type Account struct {
	ID       int
	Username string
	isActive bool
}

func SearchUser(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", websocket.ClientOrigin)
	w.Header().Set("Access-Control-Allow-Credentials", "true")
	if db.CheckToken(r.Header.Get("Authorization")) == -1 {
		w.WriteHeader(401)
		return
	}
	userName := mux.Vars(r)["username"]
	var exists bool
	err := db.DatabaseConn.QueryRow(context.Background(), "select exists(select 1 from users where username = $1)", userName).Scan(&exists)
	if err != nil {
		w.WriteHeader(500)
		return
	}
	if exists {
		w.WriteHeader(200)
		return
	}
	w.WriteHeader(404)
}
