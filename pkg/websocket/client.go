package websocket

import (
	"ChatApp/pkg/chat"
	"github.com/gorilla/websocket"
	"sync"
)

type Client struct {
	ID    string
	Conn  *websocket.Conn
	Pool  *Pool
	Mutex sync.Mutex
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
		messageType, p, err := client.Conn.ReadMessage()
		if err != nil {
			return
		}
		ID, _ := chat.IdGenerator.NextID()
		message := chat.Message{
			ID:          ID,
			MessageType: messageType,
			Content:     string(p),
		}
		//Broadcast the message to all clients in the pool
		Broadcast(message, client.Pool)
	}
}
