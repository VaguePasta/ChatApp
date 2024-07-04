package net

import (
	"ChatApp/internal/connections"
	"net/http"
)

func CheckToken(token string) int {
	client, exists := connections.ConnectionPool.Clients.Get(token)
	if !exists {
		return -1
	}
	return client.ID
}
func SetOrigin(w http.ResponseWriter, r *http.Request) {
	origin := r.Header.Get("Origin")
	w.Header().Set("Access-Control-Allow-Origin", origin)
	w.Header().Set("Access-Control-Allow-Credentials", "true")
}
