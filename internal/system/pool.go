package system

import (
	"github.com/alphadose/haxmap"
	"github.com/gorilla/websocket"
	"sync"
)

type Client struct {
	ID          uint
	Name        string
	Token       string
	Channels    *ChannelConnections
	Conn        *websocket.Conn
	ClientMutex sync.RWMutex
}
type ChannelConnections struct {
	Counter int
	List    *haxmap.Map[uint, uint8]
}

type Pool struct {
	Clients        *haxmap.Map[string, *Client]
	ClientChannels *haxmap.Map[uint, *ChannelConnections]
}

func Register(pool *Pool, client *Client) {
	pool.Clients.Set(client.Token, client)
}
func Unregister(pool *Pool, client *Client) {
	pool.Clients.Del(client.Token)
}
func NewPool() *Pool {
	return &Pool{
		Clients:        haxmap.New[string, *Client](),
		ClientChannels: haxmap.New[uint, *ChannelConnections](),
	}
}

var ConnectionPool = NewPool()

func SaveClientsChannelPrivilege(privilege string) uint8 {
	switch privilege {
	case "admin":
		return 0
	case "moderator":
		return 1
	case "member":
		return 2
	case "viewer":
		return 3
	}
	return 3
}