package main

import (
	"ChatApp/internal/chat"
	"ChatApp/internal/system"
	"ChatApp/internal/websocket"
	"fmt"
	"github.com/gorilla/mux"
	"github.com/sony/sonyflake"
	"net/http"
	"time"
)

func setupRoutes() *mux.Router {
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
		return nil
	}
	chat.IdGenerator = IdGenerator
	pool := websocket.NewPool()
	router := mux.NewRouter()
	router.HandleFunc("/auth/login", system.LogIn)
	router.HandleFunc("/ws/{token}", func(w http.ResponseWriter, r *http.Request) {
		system.ServeWs(pool, w, r)
	})
	return router
}
func main() {
	router := setupRoutes()
	err := http.ListenAndServe(":8080", router)
	if err != nil {
		fmt.Println(err)
		return
	}
}
