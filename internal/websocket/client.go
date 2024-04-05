package websocket

import (
	"ChatApp/internal/chat"
	"context"
	"encoding/json"
	"fmt"
	"github.com/gorilla/websocket"
	"github.com/jackc/pgx/v5"
	"sync"
)

type Client struct {
	ID    string
	Conn  *websocket.Conn
	Pool  *Pool
	Mutex sync.Mutex
}
type Result struct {
	channel int
	content string
}

func (client *Client) Read() {
	defer func() {
		client.Unregister(client.Pool)
		err := client.Conn.Close()
		if err != nil {
			return
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
		//textMessage := chat.Message{
		//	ID:        ID,
		//	ChannelID: message.channel,
		//	Content:   message.content,
		//}
		query := "INSERT INTO messages(message_id, channel_id, sender_id, message) VALUES (@messageID, @channelID, @senderID, @content)"
		args := pgx.NamedArgs{
			"messageID": ID,
			"channelID": message.channel,
			"senderID":  client.ID,
			"message":   message.content,
		}
		_, err = chat.DatabaseConn.Exec(context.Background(), query, args)
		if err != nil {
			fmt.Println(err)
		}
		//TODO: Send message to channel

	}
}
