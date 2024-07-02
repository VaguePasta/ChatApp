package websocket

import (
	"ChatApp/internal/db"
	"context"
	"encoding/base64"
	"encoding/json"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"io"
	"net/http"
	"strconv"
)

type Client struct {
	ID    int
	Name  string
	Token string
	Conn  *websocket.Conn
	Pool  *Pool
}
type Result struct {
	Channel int    `json:"channel"`
	Type    string `json:"type"`
	Content string `json:"content"`
}

var ClientOrigin []string

func (client *Client) Read() {
	defer func() {
		client.Unregister(client.Pool)
		err := client.Conn.Close()
		_, err = db.DatabaseConn.Exec(context.Background(), "delete from sessions where session_key = $1", client.Token)
		if err != nil {
		}
		_, err = db.DatabaseConn.Exec(context.Background(), "update users set is_active = false where user_id = $1", client.ID)
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
		ID, _ := db.IdGenerator.NextID()
		textMessage := Message{
			ID:         ID,
			ChannelID:  message.Channel,
			Type:       message.Type,
			Content:    message.Content,
			SenderName: client.Name,
			SenderID:   client.ID,
		}
		SendToChannel(client, &textMessage)
	}
}
func GetChannelMessages(pool *Pool, w http.ResponseWriter, r *http.Request) {
	origin := r.Header.Get("Origin")
	w.Header().Set("Access-Control-Allow-Origin", origin)
	w.Header().Set("Access-Control-Allow-Credentials", "true")
	token := r.Header.Get("Authorization")
	if db.CheckToken(token) == -1 {
		w.WriteHeader(401)
		return
	}
	channel := mux.Vars(r)["channelID"]
	lastMessage, _ := strconv.ParseInt(mux.Vars(r)["lastMessage"], 10, 64)
	if lastMessage == 0 {
		lastMessage = 9223372036854775807
	}
	client, _ := pool.Clients.Get(token)
	rows, _ := db.DatabaseConn.Query(context.Background(), "select message_id, channel_id, sender_id, message, type from messages where channel_id = $1 and message_id < $2 and deleted = false order by message_id desc limit 16", channel, lastMessage)
	for rows.Next() {
		var messageID uint64
		var channelID int
		var senderID int
		var senderName string
		var _type string
		var message string
		err := rows.Scan(&messageID, &channelID, &senderID, &message, &_type)
		if err != nil {
			continue
		}
		err = db.DatabaseConn.QueryRow(context.Background(), "select username from users where user_id = $1", senderID).Scan(&senderName)
		if err != nil {
			continue
		}
		SendTo(&Message{
			ID:         messageID,
			ChannelID:  channelID,
			SenderName: senderName,
			SenderID:   senderID,
			Type:       _type,
			Content:    message,
		}, client, false)
	}
	rows.Close()
	w.WriteHeader(200)
}
func SendTo(message *Message, client *Client, isNew bool) {
	if message == nil {
		return
	}
	err := client.Conn.WriteMessage(websocket.TextMessage, []byte(base64.StdEncoding.EncodeToString(ToJSON(*message, isNew))))
	if err != nil {
		return
	}
}
func DeleteMessage(pool *Pool, w http.ResponseWriter, r *http.Request) {
	origin := r.Header.Get("Origin")
	w.Header().Set("Access-Control-Allow-Origin", origin)
	w.Header().Set("Access-Control-Allow-Credentials", "true")
	token := r.Header.Get("Authorization")
	if db.CheckToken(token) == -1 {
		w.WriteHeader(401)
		return
	}
	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(400)
		return
	}
	var requester, _ = pool.Clients.Get(token)
	commandTag, err := db.DatabaseConn.Exec(context.Background(), "update messages set deleted = true where message_id = $1 and sender_id = $2 and deleted = false", body, requester.ID)
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
