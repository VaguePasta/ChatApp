package websocket

import (
	"ChatApp/internal/chat"
	"sync"
)

type Pool struct {
	mutex   sync.Mutex
	Clients map[*Client]bool
}

func (client *Client) Register(pool *Pool) {
	pool.mutex.Lock()
	defer pool.mutex.Unlock()
	pool.Clients[client] = true
	for _, v := range chat.History.Messages {
		SendTo(v, client)
	}
}
func (client *Client) Unregister(pool *Pool) {
	pool.mutex.Lock()
	defer pool.mutex.Unlock()
	delete(pool.Clients, client)
}
func NewPool() *Pool {
	return &Pool{
		Clients: make(map[*Client]bool),
	}
}
func Broadcast(message chat.Message, pool *Pool) {
	chat.History.Messages = append(chat.History.Messages, message)
	for client := range pool.Clients {
		client.Mutex.Lock() //Lock to prevent multiple messages written into the same conn at the same time.
		SendTo(message, client)
		client.Mutex.Unlock()
	}
}
func SendTo(message chat.Message, client *Client) {
	err := client.Conn.WriteMessage(1, chat.ToJSON(message))
	if err != nil {
		return
	}
}
