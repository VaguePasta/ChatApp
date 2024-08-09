package requests

import (
	"ChatApp/internal/system"
	"context"
	"encoding/json"
	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v5/pgtype"
	"golang.org/x/crypto/bcrypt"
	"io"
	"log"
	"net/http"
)

func SearchUser(w http.ResponseWriter, r *http.Request) {
	if !Authorize(w, r) {
		w.WriteHeader(401)
		return
	}
	userName := mux.Vars(r)["username"]
	var userid int
	err := system.DatabaseConn.QueryRow(context.Background(), "select user_id from users where username = $1 limit 1", userName).Scan(&userid)
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
	if !Authorize(w, r) {
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
	user, _ := system.ConnectionPool.Clients.Get(r.Header.Get("Authorization"))
	checkOldPassword, hashedOldPassword := CheckPassword(user.ID, arr[0])
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
	_, err = system.DatabaseConn.Exec(context.Background(), "update users set password = $1 where user_id = $2", hashedPassword, user.ID)
	if err != nil {
		w.WriteHeader(400)
		return
	}
	w.WriteHeader(200)
}
func GetUserInfo(w http.ResponseWriter, r *http.Request) {
	if !Authorize(w, r) {
		w.WriteHeader(401)
		return
	}
	userID := mux.Vars(r)["userid"]
	var joinDate pgtype.Date
	err := system.DatabaseConn.QueryRow(context.Background(), "select register_at from users where user_id = $1", userID).Scan(&joinDate)
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	_, err = w.Write([]byte(joinDate.Time.Format("02/01/2006")))
	if err != nil {
		return
	}
}
func ChangeUserPrivilege(w http.ResponseWriter, r *http.Request) {
	if !Authorize(w, r) {
		w.WriteHeader(401)
		return
	}
	user, _ := system.ConnectionPool.Clients.Get(r.Header.Get("Authorization"))
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
	var IDtoChange uint
	var channel uint
	var role string
	var senderRole string
	err = json.Unmarshal(arr[0], &IDtoChange)
	err = json.Unmarshal(arr[1], &channel)
	err = json.Unmarshal(arr[2], &role)
	err = system.DatabaseConn.QueryRow(context.Background(), "select privilege from participants where channel_id = $1 and user_id = $2", channel, user.ID).Scan(&senderRole)
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	if user.ID == IDtoChange {
		w.WriteHeader(403)
		return
	}
	if senderRole == "admin" {
		_, err := system.DatabaseConn.Exec(context.Background(), "update participants set privilege = $1 where user_id = $2 and channel_id = $3", role, IDtoChange, channel)
		if err != nil {
			log.Println(err)
			w.WriteHeader(500)
			return
		}
	} else if senderRole == "moderator" {
		if role == "admin" || role == "moderator" {
			w.WriteHeader(403)
			return
		}
		receiver, ok := system.ConnectionPool.ClientChannels.Get(IDtoChange)
		if ok {
			currentRole, ok := receiver.List.Get(channel)
			if !ok || currentRole == 0 || currentRole == 1 {
				w.WriteHeader(403)
				return
			}
		} else {
			var currentRole string
			err = system.DatabaseConn.QueryRow(context.Background(), "select privilege from participants where channel_id = $1 and user_id = $2", channel, IDtoChange).Scan(&currentRole)
			if err != nil || (currentRole != "member" && currentRole != "viewer") {
				w.WriteHeader(403)
				return
			}
		}
		_, err := system.DatabaseConn.Exec(context.Background(), "update participants set privilege = $1 where user_id = $2 and channel_id = $3", role, IDtoChange, channel)
		if err != nil {
			log.Println(err)
			w.WriteHeader(500)
			return
		}
	} else {
		w.WriteHeader(403)
		return
	}
	setter, ok := system.ConnectionPool.ClientChannels.Get(IDtoChange)
	if ok {
		setter.List.Set(channel, system.SaveClientsChannelPrivilege(role))
	}
	w.WriteHeader(200)
}
