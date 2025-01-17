package requests

import (
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

type Client system.Client

func (client *Client) LogIn() {
	connection, ok := system.ConnectionPool.ClientChannels.Get(client.ID)
	if !ok {
		channelList := system.ChannelConnections{
			Counter: 1,
			List:    haxmap.New[uint, uint8](),
		}
		client.Channels = &channelList
		system.ConnectionPool.ClientChannels.Set(client.ID, &channelList)
		channels, _ := system.DatabaseConn.Query(context.Background(), "select channels.channel_id, privilege from channels inner join participants on channels.channel_id = participants.channel_id where user_id = $1", client.ID)
		var privilege string
		var channelID uint
		_, err := pgx.ForEachRow(channels, []any{&channelID, &privilege}, func() error {
			channelList.List.Set(channelID, system.SaveClientsChannelPrivilege(privilege))
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
	client.Channels.List.ForEach(func(channelID uint, privilege uint8) bool {
		channel, ok := system.ConnectionPool.Channels.Get(channelID)
		if !ok {
			channel = &system.Channel{
				UserList: haxmap.New[string, *system.Client](),
			}
			system.ConnectionPool.Channels.Set(channelID, channel)
			channel.UserList.Set(client.Token, (*system.Client)(client))
		} else {
			channel.UserList.Set(client.Token, (*system.Client)(client))
		}
		return true
	})
}
func (client *Client) LogOut() {
	client.Channels.List.ForEach(func(key uint, privilege uint8) bool {
		channel, _ := system.ConnectionPool.Channels.Get(key)
		if channel.UserList.Len() == 1 {
			system.ConnectionPool.Channels.Del(key)
		} else {
			channel.UserList.Del(client.Token)
		}
		return true
	})
	if client.Channels.Counter == 1 {
		system.ConnectionPool.ClientChannels.Del(client.ID)
	} else {
		client.ClientMutex.Lock()
		client.Channels.Counter--
		client.ClientMutex.Unlock()
	}
}

func (client *Client) Read(pool *system.Pool) {
	defer func() {
		client.LogOut()
		system.Unregister(pool, (*system.Client)(client))
		err := client.Conn.Close()
		_, err = system.DatabaseConn.Exec(context.Background(), "delete from sessions where session_key = $1", client.Token)
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
			err := system.DatabaseConn.QueryRow(context.Background(), "select privilege from participants where user_id = $1 and channel_id = $2", client.ID, message.Channel).Scan(&privilege)
			client.Channels.List.Set(message.Channel, system.SaveClientsChannelPrivilege(privilege))
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
		ID, _ := system.IdGenerator.NextID()
		textMessage := system.Message{
			ID:         ID,
			ChannelID:  message.Channel,
			Type:       message.Type,
			ReplyTo:    reply,
			Content:    message.Content,
			SenderName: client.Name,
			SenderID:   client.ID,
		}
		SendToChannel(&textMessage)
	}
}

func SendToChannel(textMessage *system.Message) {
	query := "insert into messages(message_id, channel_id, sender_id, type, message) VALUES (@messageID, @channelID, @senderID, @messageType ,@content);"
	args := pgx.NamedArgs{
		"messageID":   textMessage.ID,
		"channelID":   textMessage.ChannelID,
		"senderID":    textMessage.SenderID,
		"messageType": textMessage.Type,
		"content":     textMessage.Content,
	}
	_, err := system.DatabaseConn.Exec(context.Background(), query, args)
	_, err = system.DatabaseConn.Exec(context.Background(), "update channels set last_message = $1 where channel_id = $2", textMessage.ID, textMessage.ChannelID)
	if err != nil {
		return
	}
	if textMessage.ReplyTo != nil {
		_, err := system.DatabaseConn.Exec(context.Background(), "insert into replies values($1, $2); ", *textMessage.ReplyTo, textMessage.ID)
		if err != nil {
			return
		}
		_, err = system.DatabaseConn.Exec(context.Background(), "update channels set last_message = $1 where channel_id = $2", textMessage.ID, textMessage.ChannelID)
	}
	channel, _ := system.ConnectionPool.Channels.Get(textMessage.ChannelID)
	channel.UserList.ForEach(func(token string, _client *system.Client) bool {
		SendToClient(textMessage, _client, true, false)
		return true
	})
}
