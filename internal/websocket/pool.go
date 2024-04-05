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
	//TODO: read all message in the client's channels to send to frontend
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
func SendToChannel(message chat.Message, channel chat.Channel) {
	//TODO: Write message to the database, and check if any user in the channel is online to send through conn.
}
func SendTo(message chat.Message, client *Client) {
	err := client.Conn.WriteMessage(1, chat.ToJSON(message))
	if err != nil {
		return
	}
}
