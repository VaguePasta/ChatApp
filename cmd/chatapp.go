package main

import (
	"ChatApp/internal/requests"
	"ChatApp/internal/system"
	"github.com/gorilla/handlers"
	"net/http"
)

func main() {
	if !system.OpenLog() {
		return
	}
	system.DatabaseConnect()
	requests.GetClientOrigin()
	defer system.DatabaseConn.Close()
	router := requests.SetupRoutes()
	err := http.ListenAndServe(":8080", handlers.CORS(
		handlers.AllowedHeaders([]string{"Accept", "‘Access-Control-Allow-Credentials’", "Authorization", "Accept-Language", "Content-Type", "Content-Language", "Origin"}),
		handlers.AllowedOrigins(requests.ClientOrigin),
		handlers.AllowCredentials(),
	)(router))
	if err != nil {
		return
	}
}
