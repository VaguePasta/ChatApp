package main

import (
	"ChatApp/internal/connections"
	"ChatApp/internal/net"
	"ChatApp/internal/system"
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
	connections.DatabaseConn, err = pgxpool.New(context.Background(), DatabaseURL)
	if err != nil {
		fmt.Println("Cannot connect to database.")
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
		net.ClientOrigin = append(net.ClientOrigin, scanner.Text())
	}
	return true
}
func setupRoutes() *mux.Router {
	connections.Setting = sonyflake.Settings{
		StartTime:      time.Date(2024, time.May, 22, 0, 0, 0, 0, time.UTC).Local(),
		MachineID:      nil,
		CheckMachineID: nil,
	}
	IdGenerator, err := sonyflake.New(connections.Setting)
	if err != nil {
		return nil
	}
	connections.IdGenerator = IdGenerator
	router := mux.NewRouter()
	router.HandleFunc("/auth/login", system.LogIn)
	router.HandleFunc("/auth/register", system.Register)
	router.HandleFunc("/auth/password", net.ChangePassword)
	router.HandleFunc("/channel/read", net.GetChannelList)
	router.HandleFunc("/message/read/{channelID}/{lastMessage}", func(w http.ResponseWriter, r *http.Request) {
		net.GetChannelMessages(connections.ConnectionPool, w, r)
	})
	router.HandleFunc("/channel/create", net.CreateChannel)
	router.HandleFunc("/channel/delete", net.DeleteChannel)
	router.HandleFunc("/channel/member/{channelID}", net.GetChannelMember)
	router.HandleFunc("/channel/rename", net.ChangeChannelName)
	router.HandleFunc("/channel/privilege", net.ChangeUserPrivilege)
	router.HandleFunc("/user/search/{username}", net.SearchUser)
	router.HandleFunc("/user/get/{userid}", net.GetUserInfo)
	router.HandleFunc("/ws/{token}", func(w http.ResponseWriter, r *http.Request) {
		net.ServeWs(connections.ConnectionPool, w, r)
	})
	router.HandleFunc("/message/delete", func(w http.ResponseWriter, r *http.Request) {
		net.DeleteMessage(connections.ConnectionPool, w, r)
	})
	router.HandleFunc("/message/get", func(w http.ResponseWriter, r *http.Request) {
		net.GetMessage(connections.ConnectionPool, w, r)
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
	_, _ = connections.DatabaseConn.Exec(context.Background(), "truncate table sessions")
	defer connections.DatabaseConn.Close()
	router := setupRoutes()
	err := http.ListenAndServe(":8080", handlers.CORS(
		handlers.AllowedHeaders([]string{"Accept", "‘Access-Control-Allow-Credentials’", "Authorization", "Accept-Language", "Content-Type", "Content-Language", "Origin"}),
		handlers.AllowedOrigins(net.ClientOrigin),
		handlers.AllowCredentials(),
	)(router))
	if err != nil {
		return
	}
}
