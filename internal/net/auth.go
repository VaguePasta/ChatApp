package net

import (
	"ChatApp/internal/connections"
	"net/http"
)

func CheckToken(token string) uint {
	client, exists := connections.ConnectionPool.Clients.Get(token)
	if !exists {
		return 0
	}
	return client.ID
}
func Authorize(w http.ResponseWriter, r *http.Request) bool {
	w.Header().Set("Access-Control-Allow-Origin", r.Header.Get("Origin"))
	w.Header().Set("Access-Control-Allow-Credentials", "true")
	if CheckToken(r.Header.Get("Authorization")) == 0 {
		return false
	}
	return true
}
