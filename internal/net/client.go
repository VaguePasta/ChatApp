package net

import (
	"ChatApp/internal/connections"
	"ChatApp/internal/system"
	"context"
	"encoding/base64"
	"encoding/json"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"github.com/jackc/pgx/v5"
	"io"
	"net/http"
	"strconv"
)

type Result struct {
	Channel int    `json:"channel"`
	Type    string `json:"type"`
	Content string `json:"content"`
	ReplyTo uint64 `json:"reply"`
}

var ClientOrigin []string

type Client connections.Client

func (client *Client) Read(pool *connections.Pool) {
	defer func() {
		connections.Unregister(pool, (*connections.Client)(client))
		err := client.Conn.Close()
		_, err = connections.DatabaseConn.Exec(context.Background(), "delete from sessions where session_key = $1", client.Token)
		if err != nil {
		}
		_, err = connections.DatabaseConn.Exec(context.Background(), "update users set is_active = false where user_id = $1", client.ID)
		if err != nil {
		}
	}()
	for {
		_, content, err := client.Conn.ReadMessage()
		if err != nil {
			return
		}
		var message Result
		err = json.Unmarshal(content, &message)
		if err != nil {
			continue
		}
		ID, _ := connections.IdGenerator.NextID()
		textMessage := system.Message{
			ID:         ID,
			ChannelID:  message.Channel,
			Type:       message.Type,
			ReplyTo:    message.ReplyTo,
			Content:    message.Content,
			SenderName: client.Name,
			SenderID:   client.ID,
		}
		SendToChannel(pool, &textMessage)
	}
}
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
		lastMessage = 9223372036854775807
	}
	client, _ := pool.Clients.Get(token)
	rows, _ := connections.DatabaseConn.Query(context.Background(), "select message_id, channel_id, sender_id, message, type from messages where channel_id = $1 and message_id < $2 and deleted = false order by message_id desc limit 16", channel, lastMessage)
	for rows.Next() {
		var messageID uint64
		var channelID int
		var senderID int
		var senderName string
		var replyTo uint64
		var _type string
		var message string
		err := rows.Scan(&messageID, &channelID, &senderID, &message, &_type)
		if err != nil {
			continue
		}
		err = connections.DatabaseConn.QueryRow(context.Background(), "select reply_to from replies where reply = $1", messageID).Scan(&replyTo)
		if err != nil {
			replyTo = 0
		}
		err = connections.DatabaseConn.QueryRow(context.Background(), "select username from users where user_id = $1", senderID).Scan(&senderName)
		if err != nil {
			continue
		}
		SendTo(&system.Message{
			ID:         messageID,
			ChannelID:  channelID,
			SenderName: senderName,
			SenderID:   senderID,
			ReplyTo:    replyTo,
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
	err := client.Conn.WriteMessage(websocket.TextMessage, []byte(base64.StdEncoding.EncodeToString(system.ToJSON(*message, isNew))))
	if err != nil {
		return
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
func SendToChannel(pool *connections.Pool, textMessage *system.Message) {
	query := "INSERT INTO messages(message_id, channel_id, sender_id, type, message) VALUES (@messageID, @channelID, @senderID, @messageType ,@content)"
	args := pgx.NamedArgs{
		"messageID":   textMessage.ID,
		"channelID":   textMessage.ChannelID,
		"senderID":    textMessage.SenderID,
		"messageType": textMessage.Type,
		"content":     textMessage.Content,
	}
	_, err := connections.DatabaseConn.Exec(context.Background(), query, args)
	if err != nil {
		return
	}
	if textMessage.ReplyTo != 0 {
		_, err := connections.DatabaseConn.Exec(context.Background(), "insert into replies values($1, $2)", textMessage.ReplyTo, textMessage.ID)
		if err != nil {
			return
		}
	}
	_, err = connections.DatabaseConn.Exec(context.Background(), "update channels set last_message = $1 where channel_id = $2", textMessage.ID, textMessage.ChannelID)
	if err != nil {
		return
	}
	onlineUsers, err := connections.DatabaseConn.Query(context.Background(), "select session_key from sessions inner join participants on sessions.user_id = participants.user_id where participants.channel_id = $1", textMessage.ChannelID)
	defer onlineUsers.Close()
	for onlineUsers.Next() {
		var token string
		err := onlineUsers.Scan(&token)
		if err != nil {
			continue
		}
		_client, _ := pool.Clients.Get(token)
		SendTo(textMessage, _client, true)
	}
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
		err = connections.DatabaseConn.QueryRow(context.Background(), "select message_id, channel_id, sender_id, message, type from messages where message_id = $1 and deleted = false", body).Scan(&messageID, &channelID, &senderID, &message, &_type)
		if err != nil {
			w.WriteHeader(403)
			return
		}
		err = connections.DatabaseConn.QueryRow(context.Background(), "select username from users where user_id = $1", senderID).Scan(&senderName)
		SendTo(&system.Message{
			ID:         messageID,
			ChannelID:  channelID,
			SenderName: senderName,
			SenderID:   senderID,
			ReplyTo:    0,
			Type:       _type,
			Content:    message,
		}, requester, false)
		w.WriteHeader(200)
	}
}
