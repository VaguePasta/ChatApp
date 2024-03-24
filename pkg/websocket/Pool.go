package websocket

import "sync"

type Pool struct {
	mutex   sync.Mutex
	Clients map[*Client]bool
}

func (client *Client) Register(pool *Pool) {
	pool.mutex.Lock()
	defer pool.mutex.Unlock()
	pool.Clients[client] = true
	Message{1, "A new user has connected."}.Broadcast(pool)
}
func (client *Client) Unregister(pool *Pool) {
	pool.mutex.Lock()
	defer pool.mutex.Unlock()
	delete(pool.Clients, client)
	Message{1, "An user has disconnected."}.Broadcast(pool)
}
func NewPool() *Pool {
	return &Pool{
		Clients: make(map[*Client]bool),
	}
}
