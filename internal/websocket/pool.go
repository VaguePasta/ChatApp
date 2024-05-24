package websocket

import (
	"github.com/alphadose/haxmap"
)

type Pool struct {
	Clients *haxmap.Map[string, *Client]
}

func (client *Client) Register(pool *Pool) {
	pool.Clients.Set(client.Token, client)
}
func (client *Client) Unregister(pool *Pool) {
	pool.Clients.Del(client.Token)
}
func NewPool() *Pool {
	return &Pool{
		Clients: haxmap.New[string, *Client](),
	}
}
