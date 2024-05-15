package websocket

import (
	"ChatApp/internal/chat"
	"context"
	"encoding/base64"
	"encoding/json"
	"github.com/gorilla/mux"
	"github.com/gorilla/websocket"
	"net/http"
	"sync"
)

type Client struct {
	ID    int
	Token string
	Conn  *websocket.Conn
	Pool  *Pool
	Mutex sync.Mutex
}
type Result struct {
	Channel int    `json:"channel"`
	Content string `json:"content"`
}

func (client *Client) Read() {
	defer func() {
		client.Unregister(client.Pool)
		err := client.Conn.Close()
		_, err = chat.DatabaseConn.Exec(context.Background(), "delete from sessions where session_key = $1", client.Token)
		if err != nil {
		}
		_, err = chat.DatabaseConn.Exec(context.Background(), "update users set is_active = false where user_id = $1", client.ID)
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
		ID, _ := chat.IdGenerator.NextID()
		textMessage := chat.Message{
			ID:        ID,
			ChannelID: message.Channel,
			Content:   message.Content,
			SenderID:  client.ID,
		}
		SendToChannel(client, &textMessage)
	}
}
func GetChannelMessages(pool *Pool, w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "*")
	token := mux.Vars(r)["token"]
	channel := mux.Vars(r)["channelID"]
	client := pool.Clients[token]
	rows, _ := chat.DatabaseConn.Query(context.Background(), "select message_id, channel_id, sender_id, message from messages where channel_id = $1 order by message_id asc", channel)
	for rows.Next() {
		var messageID uint64
		var channelID int
		var senderID int
		var message string
		err := rows.Scan(&messageID, &channelID, &senderID, &message)
		if err != nil {
			return
		}
		SendTo(&chat.Message{
			ID:        messageID,
			ChannelID: channelID,
			SenderID:  senderID,
			Content:   message,
		}, client, true)
	}
	rows.Close()
	w.WriteHeader(200)
}
func SendTo(message *chat.Message, client *Client, isGet bool) {
	if message == nil {
		return
	}
	err := client.Conn.WriteMessage(websocket.TextMessage, []byte(base64.StdEncoding.EncodeToString(chat.ToJSON(*message, isGet))))
	if err != nil {
		return
	}
}
