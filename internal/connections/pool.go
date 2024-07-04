package connections

import (
	"github.com/alphadose/haxmap"
	"github.com/gorilla/websocket"
	"sync"
)

type Client struct {
	ID          int
	Name        string
	Token       string
	Conn        *websocket.Conn
	ClientMutex sync.Mutex
}
type Pool struct {
	Clients *haxmap.Map[string, *Client]
}

func Register(pool *Pool, client *Client) {
	pool.Clients.Set(client.Token, client)
}
func Unregister(pool *Pool, client *Client) {
	pool.Clients.Del(client.Token)
}
func NewPool() *Pool {
	return &Pool{
		Clients: haxmap.New[string, *Client](),
	}
}

var ConnectionPool = NewPool()
