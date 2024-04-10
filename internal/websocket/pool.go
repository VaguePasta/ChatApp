package websocket

import (
	"ChatApp/internal/chat"
	"context"
	"fmt"
	"github.com/jackc/pgx/v5"
	"sync"
)

type Pool struct {
	mutex   sync.Mutex
	Clients map[string]*Client
}

func (client *Client) Register(pool *Pool) {
	pool.mutex.Lock()
	defer pool.mutex.Unlock()
	pool.Clients[client.Token] = client
}
func (client *Client) Unregister(pool *Pool) {
	pool.mutex.Lock()
	defer pool.mutex.Unlock()
	delete(pool.Clients, client.Token)
}
func NewPool() *Pool {
	return &Pool{
		Clients: make(map[string]*Client),
	}
}
func SendToChannel(client *Client, textMessage *chat.Message) {
	query := "INSERT INTO messages(message_id, channel_id, sender_id, message) VALUES (@messageID, @channelID, @senderID, @content)"
	args := pgx.NamedArgs{
		"messageID": textMessage.ID,
		"channelID": textMessage.ChannelID,
		"senderID":  client.ID,
		"content":   textMessage.Content,
	}
	_, err := chat.DatabaseConn.Exec(context.Background(), query, args)
	if err != nil {
		fmt.Println(err)
	}
	chat.DatabaseConn.Exec(context.Background(), "update channels set last_message = $1 where channel_id = $2", textMessage.ID, textMessage.ChannelID)
	onlineUsers, err := chat.DatabaseConn.Query(context.Background(), "select session_key from sessions inner join participants on sessions.user_id = participants.user_id where participants.channel_id = $1", textMessage.ChannelID)
	defer onlineUsers.Close()
	for onlineUsers.Next() {
		var token string
		err := onlineUsers.Scan(&token)
		if err != nil {
			continue
		}
		SendTo(textMessage, client.Pool.Clients[token])
	}
}
