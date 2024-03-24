package main

import (
	"ChatApp/pkg/websocket"
	"fmt"
	"net/http"
)

func serveWs(pool *websocket.Pool, w http.ResponseWriter, r *http.Request) {
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
	client.Read()
}

func setupRoutes() {
	pool := websocket.NewPool()
	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		serveWs(pool, w, r)
	})
}

func main() {
	setupRoutes()
	err := http.ListenAndServe(":8080", nil)
	if err != nil {
		fmt.Println(err)
		return
	}
}
