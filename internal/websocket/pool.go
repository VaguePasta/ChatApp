package websocket

import (
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
