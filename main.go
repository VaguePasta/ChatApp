package main

import (
	"ChatApp/pkg/chat"
	"ChatApp/pkg/websocket"
	"fmt"
	"github.com/sony/sonyflake"
	"net/http"
	"time"
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
	chat.History = chat.ChatHistory{
		ChatID:   0,
		Messages: nil,
	}
	chat.Setting = sonyflake.Settings{
		StartTime:      time.Now(),
		MachineID:      nil,
		CheckMachineID: nil,
	}
	IdGenerator, err := sonyflake.New(chat.Setting)
	if err != nil {
		fmt.Println(err)
		return
	}
	chat.IdGenerator = IdGenerator
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
