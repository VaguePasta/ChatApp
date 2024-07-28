package net

import (
	"ChatApp/internal/connections"
	"net/http"
	"slices"
)

func CheckToken(token string) int {
	client, exists := connections.ConnectionPool.Clients.Get(token)
	if !exists {
		return -1
	}
	return client.ID
}
func Authorize(w http.ResponseWriter, r *http.Request) bool {
	origin := r.Header.Get("Origin")
	w.Header().Set("Access-Control-Allow-Origin", origin)
	w.Header().Set("Access-Control-Allow-Credentials", "true")
	if !slices.Contains(ClientOrigin, origin) {
		return false
	}
	if CheckToken(r.Header.Get("Authorization")) == -1 {
		return false
	}
	return true
}
