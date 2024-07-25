package net

import (
	"ChatApp/internal/connections"
	"context"
	"encoding/json"
	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v5/pgtype"
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
func GetUserInfo(w http.ResponseWriter, r *http.Request) {
	SetOrigin(w, r)
	if CheckToken(r.Header.Get("Authorization")) == -1 {
		w.WriteHeader(401)
		return
	}
	userID := mux.Vars(r)["userid"]
	var joinDate pgtype.Date
	err := connections.DatabaseConn.QueryRow(context.Background(), "select register_at from users where user_id = $1", userID).Scan(&joinDate)
	if err != nil {
		w.WriteHeader(500)
		return
	}
	_, err = w.Write([]byte(joinDate.Time.Format("02/01/2006")))
	if err != nil {
		return
	}
}
func ChangeUserPrivilege(w http.ResponseWriter, r *http.Request) {
	SetOrigin(w, r)
	if CheckToken(r.Header.Get("Authorization")) == -1 {
		w.WriteHeader(401)
		return
	}
	user, _ := connections.ConnectionPool.Clients.Get(r.Header.Get("Authorization"))
	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(400)
		return
	}
	var arr []json.RawMessage
	err = json.Unmarshal(body, &arr)
	if err != nil {
		w.WriteHeader(400)
		return
	}
	var IDtoChange int
	var channel int
	var role string
	var senderRole string
	err = json.Unmarshal(arr[0], &IDtoChange)
	err = json.Unmarshal(arr[1], &channel)
	err = json.Unmarshal(arr[2], &role)
	err = connections.DatabaseConn.QueryRow(context.Background(), "select privilege from participants where channel_id = $1 and user_id = $2", channel, user.ID).Scan(&senderRole)
	if err != nil {
		w.WriteHeader(500)
		return
	}
	if senderRole == "admin" {
		if user.ID == IDtoChange {
			w.WriteHeader(403)
			return
		}
		_, err := connections.DatabaseConn.Exec(context.Background(), "update participants set privilege = $1 where user_id = $2 and channel_id = $3", role, IDtoChange, channel)
		if err != nil {
			w.WriteHeader(500)
			return
		}
	} else if senderRole == "moderator" {
		if role == "admin" || role == "moderator" {
			w.WriteHeader(403)
			return
		}
		var currentRole string
		err = connections.DatabaseConn.QueryRow(context.Background(), "select privilege from participants where channel_id = $1 and user_id = $2", channel, IDtoChange).Scan(&currentRole)
		if err != nil || (currentRole != "member" && currentRole != "viewer") {
			w.WriteHeader(403)
			return
		}
		_, err := connections.DatabaseConn.Exec(context.Background(), "update participants set privilege = $1 where user_id = $2 and channel_id = $3", role, IDtoChange, channel)
		if err != nil {
			w.WriteHeader(500)
			return
		}
	} else {
		w.WriteHeader(403)
		return
	}
	w.WriteHeader(200)
}
