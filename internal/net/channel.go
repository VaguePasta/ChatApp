package net

import (
	"ChatApp/internal/connections"
	"context"
	"encoding/json"
	"github.com/gorilla/mux"
	"github.com/jackc/pgx/v5"
	"io"
	"net/http"
)

type Channel struct {
	ChannelID int
	Title     string
	Privilege string
}

func GetChannelList(w http.ResponseWriter, r *http.Request) {
	SetOrigin(w, r)
	token := r.Header.Get("Authorization")
	if CheckToken(token) == -1 {
		w.WriteHeader(401)
		return
	}
	user, ok := connections.ConnectionPool.Clients.Get(token)
	if !ok {
		w.WriteHeader(404)
		return
	}
	var channelIDs []Channel
	channels, _ := connections.DatabaseConn.Query(context.Background(), "select channels.channel_id, title, privilege from channels inner join participants on channels.channel_id = participants.channel_id where user_id = $1 order by last_message desc", user.ID)
	for channels.Next() {
		var channelID int
		var title string
		var privilege string
		err := channels.Scan(&channelID, &title, &privilege)
		if err != nil {
			return
		}
		channelIDs = append(channelIDs, Channel{ChannelID: channelID, Title: title, Privilege: privilege})
		user.Channels.Set(channelID, connections.SaveClientsChannelPrivilege(privilege))
	}
	channels.Close()
	bytes, err := json.Marshal(channelIDs)
	_, _ = w.Write(bytes)
	if err != nil {
		return
	}
}
func CreateChannel(w http.ResponseWriter, r *http.Request) {
	SetOrigin(w, r)
	err := r.ParseForm()
	if err != nil {
		return
	}
	if CheckToken(r.Header.Get("Authorization")) == -1 {
		w.WriteHeader(401)
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
			w.WriteHeader(500)
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
		w.WriteHeader(500)
		return
	}
	w.WriteHeader(201)
}
func DeleteChannel(w http.ResponseWriter, r *http.Request) {
	SetOrigin(w, r)
	err := r.ParseForm()
	if err != nil {
		w.WriteHeader(400)
		return
	}
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
		w.WriteHeader(500)
		return
	}
	w.WriteHeader(200)
}
func GetChannelMember(w http.ResponseWriter, r *http.Request) {
	SetOrigin(w, r)
	if CheckToken(r.Header.Get("Authorization")) == -1 {
		w.WriteHeader(401)
		return
	}
	var members []interface{}
	channel := mux.Vars(r)["channelID"]
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
		w.WriteHeader(500)
		return
	}
	_, err = w.Write(memberList)
	if err != nil {
		w.WriteHeader(500)
		return
	}
}
func ChangeChannelName(w http.ResponseWriter, r *http.Request) {
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
		w.WriteHeader(500)
		return
	}
	w.WriteHeader(200)
}
