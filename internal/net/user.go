package net

import (
	"ChatApp/internal/connections"
	"context"
	"encoding/json"
	"github.com/gorilla/mux"
	"golang.org/x/crypto/bcrypt"
	"io"
	"net/http"
)

func SearchUser(w http.ResponseWriter, r *http.Request) {
	SetOrigin(w, r)
	if CheckToken(r.Header.Get("Authorization")) == -1 {
		w.WriteHeader(401)
		return
	}
	userName := mux.Vars(r)["username"]
	var userid int
	err := connections.DatabaseConn.QueryRow(context.Background(), "select user_id from users where username = $1 limit 1", userName).Scan(&userid)
	if err != nil {
		w.WriteHeader(404)
		return
	}
	w.WriteHeader(200)
	bytes, _ := json.Marshal(userid)
	_, _ = w.Write(bytes)
	return
}
func ChangePassword(w http.ResponseWriter, r *http.Request) {
	SetOrigin(w, r)
	if CheckToken(r.Header.Get("Authorization")) == -1 {
		w.WriteHeader(401)
		return
	}
	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(400)
		return
	}
	var arr []string
	err = json.Unmarshal(body, &arr)
	if err != nil {
		w.WriteHeader(400)
		return
	}
	user, _ := connections.ConnectionPool.Clients.Get(r.Header.Get("Authorization"))
	checkOldPassword, hashedOldPassword := connections.CheckPassword(user.ID, arr[0])
	if !checkOldPassword {
		w.WriteHeader(403)
		return
	}
	err = bcrypt.CompareHashAndPassword([]byte(hashedOldPassword), []byte(arr[1]))
	if err == nil {
		w.WriteHeader(409)
		return
	}
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(arr[1]), bcrypt.DefaultCost)
	_, err = connections.DatabaseConn.Exec(context.Background(), "update users set password = $1 where user_id = $2", hashedPassword, user.ID)
	if err != nil {
		w.WriteHeader(400)
		return
	}
	w.WriteHeader(200)
}
