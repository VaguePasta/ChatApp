package requests

import (
	"ChatApp/internal/system"
	"context"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"net/http"
	"slices"
)

var Upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return slices.Contains(ClientOrigin, r.Header.Get("Origin"))
	},
}

func ServeWs(pool *system.Pool, w http.ResponseWriter, r *http.Request) {
	token := mux.Vars(r)["token"]
	var userid uint
	var username string
	err := system.DatabaseConn.QueryRow(context.Background(), "select users.user_id, username from sessions inner join users on sessions.user_id = users.user_id where session_key = $1", token).Scan(&userid, &username)
	if err != nil {
		return
	}
	conn, err := Upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	var client = (*Client)(&system.Client{
		ID:       userid,
		Name:     username,
		Token:    token,
		Conn:     conn,
		Channels: nil,
	})
	system.Register(pool, (*system.Client)(client))
	client.LogIn()
	client.Read(pool)
}
