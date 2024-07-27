package system

import (
	"ChatApp/internal/connections"
	"context"
	"log"
	"net/http"
	"strings"
	"time"
)

func LogIn(w http.ResponseWriter, r *http.Request) {
	origin := r.Header.Get("Origin")
	w.Header().Set("Access-Control-Allow-Origin", origin)
	err := r.ParseForm()
	if err != nil {
		w.WriteHeader(400)
		return
	}
	credentials := connections.CheckCredentials(r.Form["username"][0], r.Form["password"][0])
	if credentials == "" {
		w.WriteHeader(401)
	} else {
		w.Header().Set("Content-Type", "text/plain")
		_, err := w.Write([]byte(credentials))
		if err != nil {
			return
		}
		go waitToRemove(strings.Split(credentials, "/")[1])
	}
}
func waitToRemove(token string) {
	time.Sleep(10 * time.Second)
	_, exists := connections.ConnectionPool.Clients.Get(token)
	if !exists {
		_, err := connections.DatabaseConn.Exec(context.Background(), "delete from sessions where session_key = $1", token)
		if err != nil {
			log.Println(err)
			return
		}
	}
}
