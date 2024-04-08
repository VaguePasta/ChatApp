package main

import (
	"ChatApp/internal/chat"
	"ChatApp/internal/system"
	"ChatApp/internal/websocket"
	"bufio"
	"context"
	"fmt"
	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/sony/sonyflake"
	"net/http"
	"os"
	"time"
)

func databaseConnect() bool {
	DatabaseCredentials, err := os.Open("credentials.txt")
	if err != nil {
		fmt.Println("No credentials found.")
		return false
	}
	scanner := bufio.NewScanner(DatabaseCredentials)
	info := new([]string)
	for scanner.Scan() {
		*info = append(*info, scanner.Text())
	}
	DatabaseURL := "postgresql://" + (*info)[0] + ":" + (*info)[1] + "@" + (*info)[2] + ":" + (*info)[3] + "/" + (*info)[4]
	chat.DatabaseConn, err = pgxpool.New(context.Background(), DatabaseURL)
	if err != nil {
		fmt.Println("Cannot connect to database.")
		return false
	}
	return true
}
func setupRoutes() *mux.Router {
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
	router.HandleFunc("/auth/register", system.Register)
	router.HandleFunc("/ws/{token}", func(w http.ResponseWriter, r *http.Request) {
		system.ServeWs(pool, w, r)
	})
	return router
}
func main() {
	if !databaseConnect() {
		return
	}
	defer chat.DatabaseConn.Close()
	router := setupRoutes()
	err := http.ListenAndServe(":8080", router)
	if err != nil {
		fmt.Println(err)
		return
	}
}
