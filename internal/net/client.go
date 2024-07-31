package net

import (
	"ChatApp/internal/connections"
	"ChatApp/internal/system"
	"bufio"
	"context"
	"encoding/json"
	"github.com/alphadose/haxmap"
	"github.com/jackc/pgx/v5"
	"log"
	"os"
)

type Result struct {
	Channel uint   `json:"channel"`
	Type    string `json:"type"`
	Content string `json:"content"`
	ReplyTo int64  `json:"reply"`
}

var ClientOrigin []string

func GetClientOrigin() {
	client, err := os.Open(os.Getenv("CLOrigin"))
	if err != nil {
		log.Fatal("FATAL: Cannot get client origin. " + err.Error())
	}
	scanner := bufio.NewScanner(client)
	for scanner.Scan() {
		ClientOrigin = append(ClientOrigin, scanner.Text())
	}
}

type Client connections.Client

func (client *Client) LogIn() {
	connection, ok := connections.ConnectionPool.ClientChannels.Get(client.ID)
	if !ok {
		channelList := connections.ChannelConnections{
			Counter: 1,
			List:    haxmap.New[uint, uint8](),
		}
		client.Channels = &channelList
		connections.ConnectionPool.ClientChannels.Set(client.ID, &channelList)
		channels, _ := connections.DatabaseConn.Query(context.Background(), "select channels.channel_id, privilege from channels inner join participants on channels.channel_id = participants.channel_id where user_id = $1", client.ID)
		var privilege string
		var channelID uint
		_, err := pgx.ForEachRow(channels, []any{&channelID, &privilege}, func() error {
			channelList.List.Set(channelID, connections.SaveClientsChannelPrivilege(privilege))
			return nil
		})
		if err != nil {
			log.Println(err)
		}
	} else {
		client.Channels = connection
		client.ClientMutex.Lock()
		connection.Counter++
		client.ClientMutex.Unlock()
	}
}
func (client *Client) LogOut() {
	if client.Channels.Counter == 1 {
		connections.ConnectionPool.ClientChannels.Del(client.ID)
	} else {
		client.ClientMutex.Lock()
		client.Channels.Counter--
		client.ClientMutex.Unlock()
	}
}

func (client *Client) Read(pool *connections.Pool) {
	defer func() {
		client.LogOut()
		connections.Unregister(pool, (*connections.Client)(client))
		err := client.Conn.Close()
		_, err = connections.DatabaseConn.Exec(context.Background(), "delete from sessions where session_key = $1", client.Token)
		if err != nil {
			log.Println(err)
		}
	}()
	for {
		_, content, err := client.Conn.ReadMessage()
		if err != nil {
			break
		}
		var message Result
		err = json.Unmarshal(content, &message)
		if err != nil {
			continue
		}
		privilegeInt, ok := client.Channels.List.Get(message.Channel)
		if !ok {
			var privilege string
			err := connections.DatabaseConn.QueryRow(context.Background(), "select privilege from participants where user_id = $1 and channel_id = $2", client.ID, message.Channel).Scan(&privilege)
			client.Channels.List.Set(message.Channel, connections.SaveClientsChannelPrivilege(privilege))
			if err != nil || privilege == "viewer" {
				continue
			}
		} else if privilegeInt == 3 {
			continue
		}
		var reply = new(uint64)
		if message.ReplyTo == 0 {
			reply = nil
		} else {
			*reply = uint64(message.ReplyTo)
		}
		ID, _ := connections.IdGenerator.NextID()
		textMessage := system.Message{
			ID:         ID,
			ChannelID:  message.Channel,
			Type:       message.Type,
			ReplyTo:    reply,
			Content:    message.Content,
			SenderName: client.Name,
			SenderID:   client.ID,
		}
		SendToChannel(pool, &textMessage)
	}
}

func SendToChannel(pool *connections.Pool, textMessage *system.Message) {
	query := "insert into messages(message_id, channel_id, sender_id, type, message) VALUES (@messageID, @channelID, @senderID, @messageType ,@content);"
	args := pgx.NamedArgs{
		"messageID":   textMessage.ID,
		"channelID":   textMessage.ChannelID,
		"senderID":    textMessage.SenderID,
		"messageType": textMessage.Type,
		"content":     textMessage.Content,
	}
	_, err := connections.DatabaseConn.Exec(context.Background(), query, args)
	_, err = connections.DatabaseConn.Exec(context.Background(), "update channels set last_message = $1 where channel_id = $2", textMessage.ID, textMessage.ChannelID)
	if err != nil {
		return
	}
	if textMessage.ReplyTo != nil {
		_, err := connections.DatabaseConn.Exec(context.Background(), "insert into replies values($1, $2); ", *textMessage.ReplyTo, textMessage.ID)
		if err != nil {
			return
		}
		_, err = connections.DatabaseConn.Exec(context.Background(), "update channels set last_message = $1 where channel_id = $2", textMessage.ID, textMessage.ChannelID)
	}
	onlineUsers, err := connections.DatabaseConn.Query(context.Background(), "select session_key from sessions inner join participants on sessions.user_id = participants.user_id where participants.channel_id = $1", textMessage.ChannelID)
	for onlineUsers.Next() {
		var token string
		err := onlineUsers.Scan(&token)
		if err != nil {
			continue
		}
		_client, _ := pool.Clients.Get(token)
		SendTo(textMessage, _client, true)
	}
}
