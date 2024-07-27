package net

import (
	"ChatApp/internal/connections"
	"ChatApp/internal/system"
	"context"
	"encoding/base64"
	"encoding/json"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"io"
	"math"
	"net/http"
	"strconv"
)

func GetChannelMessages(pool *connections.Pool, w http.ResponseWriter, r *http.Request) {
	SetOrigin(w, r)
	token := r.Header.Get("Authorization")
	if CheckToken(token) == -1 {
		w.WriteHeader(401)
		return
	}
	channel := mux.Vars(r)["channelID"]
	lastMessage, _ := strconv.ParseInt(mux.Vars(r)["lastMessage"], 10, 64)
	if lastMessage == 0 {
		lastMessage = math.MaxInt64
	}
	client, _ := pool.Clients.Get(token)
	rows, _ := connections.DatabaseConn.Query(context.Background(), "select message_id, channel_id, sender_id, message, type, reply_to, username from (messages inner join users on messages.sender_id = users.user_id) left join replies on messages.message_id = replies.reply where channel_id = $1 and message_id < $2 and deleted = false order by message_id desc limit 16 ", channel, lastMessage)
	for rows.Next() {
		var messageID uint64
		var channelID int
		var senderID int
		var senderName string
		var replyTo *int64
		var _type string
		var message string
		err := rows.Scan(&messageID, &channelID, &senderID, &message, &_type, &replyTo, &senderName)
		if err != nil {
			continue
		}
		if replyTo == nil {
			replyTo = new(int64)
			*replyTo = 0
		}
		SendTo(&system.Message{
			ID:         messageID,
			ChannelID:  channelID,
			SenderName: senderName,
			SenderID:   senderID,
			ReplyTo:    *replyTo,
			Type:       _type,
			Content:    message,
		}, client, false)
	}
	rows.Close()
	w.WriteHeader(200)
}
func SendTo(message *system.Message, client *connections.Client, isNew bool) {
	if message == nil {
		return
	}
	client.ClientMutex.Lock()
	defer client.ClientMutex.Unlock()
	jsonified := system.ToJSON(*message, isNew)
	if jsonified != nil {
		err := client.Conn.WriteMessage(websocket.TextMessage, []byte(base64.StdEncoding.EncodeToString(jsonified)))
		if err != nil {
			return
		}
	}
}
func DeleteMessage(pool *connections.Pool, w http.ResponseWriter, r *http.Request) {
	SetOrigin(w, r)
	token := r.Header.Get("Authorization")
	if CheckToken(token) == -1 {
		w.WriteHeader(401)
		return
	}
	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(400)
		return
	}
	var requester, _ = pool.Clients.Get(token)
	commandTag, err := connections.DatabaseConn.Exec(context.Background(), "update messages set deleted = true where message_id = $1 and sender_id = $2 and deleted = false", body, requester.ID)
	if err != nil {
		w.WriteHeader(400)
		return
	}
	if commandTag.RowsAffected() == 0 {
		w.WriteHeader(404)
		return
	}
	w.WriteHeader(200)
}

func GetMessage(pool *connections.Pool, w http.ResponseWriter, r *http.Request) {
	SetOrigin(w, r)
	token := r.Header.Get("Authorization")
	if CheckToken(token) == -1 {
		w.WriteHeader(401)
		return
	}
	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(400)
		return
	}
	var requester, _ = pool.Clients.Get(token)
	var permitted = false
	err = connections.DatabaseConn.QueryRow(context.Background(), "select exists(select 1 from participants where user_id = $1 and channel_id = (select channel_id from messages where message_id = $2))", requester.ID, body).Scan(&permitted)
	if err != nil || !permitted {
		w.WriteHeader(401)
		return
	} else {
		var messageID uint64
		var channelID int
		var senderID int
		var senderName string
		var _type string
		var message string
		err = connections.DatabaseConn.QueryRow(context.Background(), "select message_id, channel_id, sender_id, message, type, username from messages inner join users on sender_id = user_id where message_id = $1 and deleted = false", body).Scan(&messageID, &channelID, &senderID, &message, &_type, &senderName)
		if err != nil {
			w.WriteHeader(403)
			return
		}
		messageFetch := struct {
			ID         uint64
			Channel    int
			SenderName string
			Type       string
			Text       string
			Fetch      bool
		}{
			ID:         messageID,
			Channel:    channelID,
			SenderName: senderName,
			Type:       _type,
			Text:       message,
			Fetch:      true,
		}
		marshaled, _ := json.Marshal(messageFetch)
		_, err := w.Write([]byte(base64.StdEncoding.EncodeToString(system.Compress(marshaled))))
		if err != nil {
			w.WriteHeader(500)
		}
	}
}
