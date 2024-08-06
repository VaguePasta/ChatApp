package net

import (
	"ChatApp/internal/connections"
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v5"
	"io"
	"log"
	"net/http"
	"strconv"
)

type Channel struct {
	ChannelID uint
	Title     string
	Privilege string
	Code      *string
}

func GetChannelList(w http.ResponseWriter, r *http.Request) {
	if !Authorize(w, r) {
		w.WriteHeader(401)
		return
	}
	user, ok := connections.ConnectionPool.Clients.Get(r.Header.Get("Authorization"))
	if !ok {
		w.WriteHeader(404)
		return
	}
	var channelIDs []Channel
	channels, _ := connections.DatabaseConn.Query(context.Background(), "select channels.channel_id, title, privilege, code from channels inner join participants on channels.channel_id = participants.channel_id left join invite_code on channels.channel_id = invite_code.channel_id where user_id = $1 order by last_message desc", user.ID)
	var channelID uint
	var title string
	var privilege string
	var inviteCode *string
	_, err := pgx.ForEachRow(channels, []any{&channelID, &title, &privilege, &inviteCode}, func() error {
		channelIDs = append(channelIDs, Channel{ChannelID: channelID, Title: title, Privilege: privilege, Code: inviteCode})
		return nil
	})
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	bytes, err := json.Marshal(channelIDs)
	_, _ = w.Write(bytes)
	if err != nil {
		return
	}
}
func CreateChannel(w http.ResponseWriter, r *http.Request) {
	if !Authorize(w, r) {
		w.WriteHeader(401)
		return
	}
	err := r.ParseForm()
	if err != nil {
		return
	}
	body, err := io.ReadAll(r.Body)
	var arr []json.RawMessage
	err = json.Unmarshal(body, &arr)
	if err != nil {
		w.WriteHeader(400)
		return
	}
	createTime, _ := connections.IdGenerator.NextID()
	var channelId string
	var channelName string
	err = json.Unmarshal(arr[0], &channelName)
	if err != nil {
		w.WriteHeader(400)
		return
	}
	err = connections.DatabaseConn.QueryRow(context.Background(), "insert into channels (title, create_date, last_message) values ($1, (select current_date), $2) returning channel_id", channelName, createTime).Scan(&channelId)
	if err != nil {
		w.WriteHeader(500)
		return
	}
	arr = arr[1:]
	var users [][]interface{}
	for _, element := range arr {
		var user []interface{}
		err = json.Unmarshal(element, &user)
		if err != nil {
			w.WriteHeader(400)
			return
		}
		users = append(users, []interface{}{
			user[0],
			channelId,
			user[1],
		})
	}
	_, err = connections.DatabaseConn.CopyFrom(context.Background(), pgx.Identifier{"participants"}, []string{"user_id", "channel_id", "privilege"}, pgx.CopyFromRows(users))
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	w.WriteHeader(201)
}
func DeleteChannel(w http.ResponseWriter, r *http.Request) {
	if !Authorize(w, r) {
		w.WriteHeader(401)
		return
	}
	err := r.ParseForm()
	if err != nil {
		w.WriteHeader(400)
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
	var privilege string
	err = connections.DatabaseConn.QueryRow(context.Background(), "select privilege from participants where user_id = $1 and channel_id = $2", arr[0], arr[1]).Scan(&privilege)
	if err != nil {
		w.WriteHeader(404)
		return
	}
	if privilege != "admin" {
		w.WriteHeader(401)
		return
	}
	_, err = connections.DatabaseConn.Exec(context.Background(), "delete from channels where channel_id = $1", arr[1])
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	w.WriteHeader(200)
}
func GetChannelMember(w http.ResponseWriter, r *http.Request) {
	if !Authorize(w, r) {
		w.WriteHeader(401)
		return
	}
	channel, _ := strconv.ParseUint(mux.Vars(r)["channelID"], 10, 32)
	user, _ := connections.ConnectionPool.Clients.Get(r.Header.Get("Authorization"))
	_, ok := user.Channels.List.Get(uint(channel))
	if !ok {
		w.WriteHeader(403)
		return
	}
	var members []interface{}
	rows, _ := connections.DatabaseConn.Query(context.Background(), "select users.user_id, username, privilege from participants inner join users on participants.user_id = users.user_id where channel_id = $1 order by privilege, username", channel)
	for rows.Next() {
		var userId int
		var user [2]string
		err := rows.Scan(&userId, &user[0], &user[1])
		if err != nil {
			continue
		}
		userInfo := []interface{}{userId, user[0], user[1]}
		members = append(members, userInfo)
	}
	memberList, err := json.Marshal(members)
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	_, err = w.Write(memberList)
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
}
func ChangeChannelName(w http.ResponseWriter, r *http.Request) {
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
	var privilege string
	err = connections.DatabaseConn.QueryRow(context.Background(), "select privilege from participants where user_id = $1 and channel_id = $2", arr[0], arr[1]).Scan(&privilege)
	if err != nil {
		w.WriteHeader(404)
		return
	}
	if privilege != "admin" {
		w.WriteHeader(401)
		return
	}
	_, err = connections.DatabaseConn.Exec(context.Background(), "update channels set title = $1 where channel_id = $2", arr[2], arr[1])
	if err != nil {
		log.Println(err)
		w.WriteHeader(500)
		return
	}
	w.WriteHeader(200)
}
func LeaveChannel(w http.ResponseWriter, r *http.Request) {
	if !Authorize(w, r) {
		w.WriteHeader(401)
		return
	}
	user, ok := connections.ConnectionPool.Clients.Get(r.Header.Get("Authorization"))
	if !ok {
		w.WriteHeader(401)
		return
	}
	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(400)
		return
	}
	var channel uint
	err = json.Unmarshal(body, &channel)
	if err != nil {
		w.WriteHeader(400)
		return
	}
	currentPrivilege, ok := user.Channels.List.Get(channel)
	if currentPrivilege == 0 {
		w.WriteHeader(403)
		return
	} else {
		_, err := connections.DatabaseConn.Exec(context.Background(), "delete from participants where user_id = $1 and channel_id = $2", user.ID, channel)
		if err != nil {
			w.WriteHeader(500)
			return
		}
		user.Channels.List.Del(channel)
	}
	w.WriteHeader(200)
}
func JoinChannel(w http.ResponseWriter, r *http.Request) {
	if !Authorize(w, r) {
		w.WriteHeader(401)
		return
	}
	sender, ok := connections.ConnectionPool.Clients.Get(r.Header.Get("Authorization"))
	if !ok {
		w.WriteHeader(401)
		return
	}
	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(400)
		return
	}
	var joinRequest [2]json.RawMessage
	err = json.Unmarshal(body, &joinRequest)
	if err != nil {
		w.WriteHeader(400)
		return
	}
	var requestType uint8
	err = json.Unmarshal(joinRequest[0], &requestType)
	if err != nil {
		w.WriteHeader(400)
		return
	}
	if requestType == 0 { //[receiverID, channel, privilege]
		var inviteInfo []interface{}
		err = json.Unmarshal(joinRequest[1], &inviteInfo)
		if err != nil {
			w.WriteHeader(400)
			return
		}
		userID, i := inviteInfo[1].(uint)
		if !i {
			w.WriteHeader(400)
			return
		}
		senderPrivilege, _ := sender.Channels.List.Get(userID)
		if senderPrivilege != 0 && senderPrivilege != 1 {
			w.WriteHeader(403)
			return
		}
		cmdTag, err := connections.DatabaseConn.Exec(context.Background(), "insert into participants values($1, $2, $3) on conflict do nothing", inviteInfo[0], inviteInfo[1], inviteInfo[2])
		if err != nil {
			w.WriteHeader(500)
			return
		}
		if cmdTag.RowsAffected() == 0 {
			w.WriteHeader(409)
			return
		}
	} else if requestType == 1 {
		var inviteCode string
		err := json.Unmarshal(joinRequest[1], &inviteCode)
		if err != nil {
			w.WriteHeader(400)
			return
		}
		var channel uint
		err = connections.DatabaseConn.QueryRow(context.Background(), "insert into participants values($1, (select channel_id from invite_code where code = $2), 'member') on conflict do nothing returning channel_id", sender.ID, inviteCode).Scan(&channel)
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				w.WriteHeader(409)
				return
			} else {
				w.WriteHeader(403)
				return
			}
		}
		sender.Channels.List.Set(channel, 2)
		w.WriteHeader(200)
		return
	} else {
		w.WriteHeader(400)
		return
	}
}
func ChannelCode(w http.ResponseWriter, r *http.Request) {
	if !Authorize(w, r) {
		w.WriteHeader(401)
		return
	}
	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(400)
		return
	}
	var bodyInfo []uint //[0|1,channel_id]  0: Create/modify code, 1: Delete code
	err = json.Unmarshal(body, &bodyInfo)
	if err != nil {
		w.WriteHeader(400)
		return
	}
	user, ok := connections.ConnectionPool.Clients.Get(r.Header.Get("Authorization"))
	if !ok {
		w.WriteHeader(401)
		return
	}
	privilege, ok := user.Channels.List.Get(bodyInfo[1])
	if !ok || privilege != 0 {
		w.WriteHeader(401)
		return
	}
	if bodyInfo[0] == 0 {
		randomBytes := make([]byte, 4)
		_, err = rand.Read(randomBytes)
		if err != nil {
			w.WriteHeader(500)
			return
		}
		code := hex.EncodeToString(randomBytes)
		_, err := connections.DatabaseConn.Exec(context.Background(), "insert into invite_code values($1, $2) on conflict (channel_id) do update set code = excluded.code", bodyInfo[1], code)
		if err != nil {
			w.WriteHeader(500)
			return
		}
		_, err = w.Write([]byte(code))
		if err != nil {
			w.WriteHeader(200)
			return
		}
		return
	} else if bodyInfo[1] == 1 {
		_, err := connections.DatabaseConn.Exec(context.Background(), "delete from invite_code where channel_id = $1", bodyInfo[1])
		if err != nil {
			w.WriteHeader(500)
			return
		}
	}
}
