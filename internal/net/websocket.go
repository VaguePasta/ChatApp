package net

import (
	"ChatApp/internal/connections"
	"context"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"net/http"
)

var Upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin:     func(r *http.Request) bool { return true },
}

func ServeWs(pool *connections.Pool, w http.ResponseWriter, r *http.Request) {
	token := mux.Vars(r)["token"]
	var userid int
	err := connections.DatabaseConn.QueryRow(context.Background(), "select user_id from sessions where session_key = $1", token).Scan(&userid)
	if err != nil {
		return
	}
	var username string
	err = connections.DatabaseConn.QueryRow(context.Background(), "update users set is_active = true where user_id = $1 returning username", userid).Scan(&username)
	if err != nil {
		return
	}
	conn, err := Upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	var client = (*Client)(&connections.Client{
		ID:    userid,
		Name:  username,
		Token: token,
		Conn:  conn,
	})
	connections.Register(pool, (*connections.Client)(client))
	client.Read(pool)
}
