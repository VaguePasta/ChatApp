package main

import (
	"ChatApp/internal/db"
	"ChatApp/internal/system"
	"ChatApp/internal/websocket"
	"bufio"
	"context"
	"fmt"
	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/sony/sonyflake"
	"net/http"
	"os"
	"time"
)

func databaseConnect() bool {
	DatabaseCredentials, err := os.Open("DBcredentials.txt")
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
	db.DatabaseConn, err = pgxpool.New(context.Background(), DatabaseURL)
	if err != nil {
		fmt.Println("Cannot connect to db.")
		return false
	}
	return true
}
func GetClientOrigin() bool {
	client, err := os.Open("CLorigin.txt")
	if err != nil {
		fmt.Println("No client origin found.")
		return false
	}
	scanner := bufio.NewScanner(client)
	for scanner.Scan() {
		websocket.ClientOrigin = append(websocket.ClientOrigin, scanner.Text())
	}
	return true
}
func setupRoutes() *mux.Router {
	db.Setting = sonyflake.Settings{
		StartTime:      time.Date(2024, time.May, 22, 0, 0, 0, 0, time.UTC).Local(),
		MachineID:      nil,
		CheckMachineID: nil,
	}
	IdGenerator, err := sonyflake.New(db.Setting)
	if err != nil {
		return nil
	}
	db.IdGenerator = IdGenerator
	pool := websocket.NewPool()
	router := mux.NewRouter()
	router.HandleFunc("/auth/login", system.LogIn)
	router.HandleFunc("/auth/register", system.Register)
	router.HandleFunc("/channel/read", system.GetChatData)
	router.HandleFunc("/message/{channelID}/{lastMessage}", func(w http.ResponseWriter, r *http.Request) {
		websocket.GetChannelMessages(pool, w, r)
	})
	router.HandleFunc("/channel/create", system.CreateChannel)
	router.HandleFunc("/channel/delete", system.DeleteChannel)
	router.HandleFunc("/channel/member/{channelID}", system.GetChannelMember)
	router.HandleFunc("/channel/rename", system.ChangeChannelName)
	router.HandleFunc("/user/{username}", system.SearchUser)
	router.HandleFunc("/ws/{token}", func(w http.ResponseWriter, r *http.Request) {
		system.ServeWs(pool, w, r)
	})
	return router
}
func main() {
	if !databaseConnect() {
		return
	}
	if !GetClientOrigin() {
		return
	}
	db.DatabaseConn.Exec(context.Background(), "truncate table sessions")
	defer db.DatabaseConn.Close()
	router := setupRoutes()
	err := http.ListenAndServe(":8080", handlers.CORS(
		handlers.AllowedHeaders([]string{"Accept", "‘Access-Control-Allow-Credentials’", "Authorization", "Accept-Language", "Content-Type", "Content-Language", "Origin"}),
		handlers.AllowedOrigins(websocket.ClientOrigin),
		handlers.AllowCredentials(),
	)(router))
	if err != nil {
		return
	}
}
