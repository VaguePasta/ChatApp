package net

import (
	"ChatApp/internal/connections"
	"context"
	"encoding/json"
	"github.com/gorilla/mux"
	"io"
	"net/http"
)

type Channel struct {
	ChannelID int
	Title     string
}

func GetChannelList(w http.ResponseWriter, r *http.Request) {
	SetOrigin(w, r)
	token := r.Header.Get("Authorization")
	if CheckToken(token) == -1 {
		w.WriteHeader(401)
		return
	}
	var userid int
	err := connections.DatabaseConn.QueryRow(context.Background(), "select user_id from sessions where session_key=$1", token).Scan(&userid)
	if err != nil {
		w.WriteHeader(404)
		return
	}
	var channelIDs []Channel
	channels, _ := connections.DatabaseConn.Query(context.Background(), "select channel_id, title from channels where channel_id in (select channel_id from participants where user_id = $1) order by last_message", userid)
	for channels.Next() {
		var channelID int
		var title string
		err := channels.Scan(&channelID, &title)
		if err != nil {
			return
		}
		channelIDs = append(channelIDs, Channel{ChannelID: channelID, Title: title})
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
	var arr []string
	err = json.Unmarshal(body, &arr)
	if err != nil {
		w.WriteHeader(400)
		return
	}
	createTime, _ := connections.IdGenerator.NextID()
	var channelId string
	err = connections.DatabaseConn.QueryRow(context.Background(), "insert into channels (title, create_date, last_message) values ($1, (select current_date), $2) returning channel_id", arr[0]+"'s chat", createTime).Scan(&channelId)
	if err != nil {
		w.WriteHeader(500)
		return
	}
	for index, element := range arr {
		var privilege string
		if index == 0 {
			privilege = "admin"
		} else {
			privilege = "member"
		}
		var userId string
		err := connections.DatabaseConn.QueryRow(context.Background(), "select user_id from users where username = $1", element).Scan(&userId)
		if err != nil {
			continue
		}
		_, err = connections.DatabaseConn.Exec(context.Background(), "insert into participants (user_id, channel_id, privilege) values ($1, $2, $3)", userId, channelId, privilege)
		if err != nil {
			continue
		}
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
	var members [][2]string
	channel := mux.Vars(r)["channelID"]
	rows, _ := connections.DatabaseConn.Query(context.Background(), "select username, privilege from participants inner join users on participants.user_id = users.user_id where channel_id = $1 order by privilege, username", channel)
	for rows.Next() {
		var user [2]string
		err := rows.Scan(&user[0], &user[1])
		if err != nil {
			continue
		}
		members = append(members, user)
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
