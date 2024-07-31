package main

import (
	"ChatApp/internal/connections"
	"ChatApp/internal/logger"
	"ChatApp/internal/net"
	"github.com/gorilla/handlers"
	"net/http"
)

func main() {
	if !logger.OpenLog() {
		return
	}
	connections.DatabaseConnect()
	net.GetClientOrigin()
	defer connections.DatabaseConn.Close()
	router := net.SetupRoutes()
	err := http.ListenAndServe(":8080", handlers.CORS(
		handlers.AllowedHeaders([]string{"Accept", "‘Access-Control-Allow-Credentials’", "Authorization", "Accept-Language", "Content-Type", "Content-Language", "Origin"}),
		handlers.AllowedOrigins(net.ClientOrigin),
		handlers.AllowCredentials(),
	)(router))
	if err != nil {
		return
	}
}
