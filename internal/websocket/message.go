package websocket

import (
	"ChatApp/internal/db"
	"bytes"
	"compress/gzip"
	"context"
	"encoding/json"
	"github.com/jackc/pgx/v5"
	"github.com/sony/sonyflake"
)

type Message struct {
	ID         uint64
	ChannelID  int
	SenderID   int
	SenderName string
	Type       string
	Content    string
}
type SendMessage struct {
	isNew      bool
	ID         uint64
	TimeStamp  string
	Type       string
	Text       string
	SenderID   int
	SenderName string
	Channel    int
}

func Compress(src []byte) []byte {
	var buf bytes.Buffer
	gz := gzip.NewWriter(&buf)
	_, err := gz.Write(src)
	if err != nil {
		return nil
	}
	err = gz.Close()
	if err != nil {
		return nil
	}
	return buf.Bytes()
}
func ToJSON(message Message, _isNew bool) []byte {
	jsonified, _ := json.Marshal(SendMessage{
		isNew:      _isNew,
		ID:         message.ID,
		SenderID:   message.SenderID,
		SenderName: message.SenderName,
		Channel:    message.ChannelID,
		TimeStamp:  db.Setting.StartTime.Add(sonyflake.ElapsedTime(message.ID)).Format("02/01/2006 15:04:05"),
		Type:       message.Type,
		Text:       message.Content,
	})
	return Compress(jsonified)
}
func SendToChannel(client *Client, textMessage *Message) {
	query := "INSERT INTO messages(message_id, channel_id, sender_id, type, message) VALUES (@messageID, @channelID, @senderID, @messageType ,@content)"
	args := pgx.NamedArgs{
		"messageID":   textMessage.ID,
		"channelID":   textMessage.ChannelID,
		"senderID":    textMessage.SenderID,
		"messageType": textMessage.Type,
		"content":     textMessage.Content,
	}
	_, err := db.DatabaseConn.Exec(context.Background(), query, args)
	if err != nil {
		return
	}
	db.DatabaseConn.Exec(context.Background(), "update channels set last_message = $1 where channel_id = $2", textMessage.ID, textMessage.ChannelID)
	onlineUsers, err := db.DatabaseConn.Query(context.Background(), "select session_key from sessions inner join participants on sessions.user_id = participants.user_id where participants.channel_id = $1", textMessage.ChannelID)
	defer onlineUsers.Close()
	for onlineUsers.Next() {
		var token string
		err := onlineUsers.Scan(&token)
		if err != nil {
			continue
		}
		_client, _ := client.Pool.Clients.Get(token)
		SendTo(textMessage, _client, true)
	}
}
