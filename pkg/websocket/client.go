package websocket

import (
	"github.com/gorilla/websocket"
	"sync"
)

type Client struct {
	ID    string
	Conn  *websocket.Conn
	Pool  *Pool
	Mutex sync.Mutex
}
type Message struct {
	MessageType int
	Content     string
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
		message := Message{MessageType: messageType, Content: string(p)}
		//Broadcast the message to all clients in the pool
		message.Broadcast(client.Pool)
	}
}
func (message Message) Broadcast(pool *Pool) {
	for client := range pool.Clients {
		client.Mutex.Lock() //Lock to prevent multiple messages written into the same conn at the same time.
		err := client.Conn.WriteMessage(1, []byte(message.Content))
		if err != nil {
			return
		}
		client.Mutex.Unlock()
	}
}
