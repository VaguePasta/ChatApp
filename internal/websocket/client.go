package websocket

import (
	"ChatApp/internal/chat"
	"context"
	"encoding/json"
	"fmt"
	"github.com/gorilla/websocket"
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
			fmt.Println(err)
		}
		_, err = chat.DatabaseConn.Exec(context.Background(), "update users set is_active = false where user_id = $1", client.ID)
		if err != nil {
			fmt.Println(err)
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
			fmt.Println(err)
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
