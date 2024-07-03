package websocket

import (
	"ChatApp/internal/db"
	"bytes"
	"compress/gzip"
	"context"
	"encoding/json"
	"github.com/jackc/pgx/v5"
	"github.com/sony/sonyflake"
	"io"
	"net/http"
)

type Message struct {
	ID         uint64
	ChannelID  int
	SenderID   int
	SenderName string
	Type       string
	Content    string
	ReplyTo    uint64
}
type SendMessage struct {
	isNew      bool
	ID         uint64
	TimeStamp  string
	Type       string
	Text       string
	ReplyTo    uint64
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
		ReplyTo:    message.ReplyTo,
		Type:       message.Type,
		Text:       message.Content,
	})
	return Compress(jsonified)
}
func SendToChannel(pool *Pool, textMessage *Message) {
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
	if textMessage.ReplyTo != 0 {
		_, err := db.DatabaseConn.Exec(context.Background(), "insert into replies values($1, $2)", textMessage.ReplyTo, textMessage.ID)
		if err != nil {
			return
		}
	}
	_, err = db.DatabaseConn.Exec(context.Background(), "update channels set last_message = $1 where channel_id = $2", textMessage.ID, textMessage.ChannelID)
	if err != nil {
		return
	}
	onlineUsers, err := db.DatabaseConn.Query(context.Background(), "select session_key from sessions inner join participants on sessions.user_id = participants.user_id where participants.channel_id = $1", textMessage.ChannelID)
	defer onlineUsers.Close()
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
func GetMessage(pool *Pool, w http.ResponseWriter, r *http.Request) {
	origin := r.Header.Get("Origin")
	w.Header().Set("Access-Control-Allow-Origin", origin)
	w.Header().Set("Access-Control-Allow-Credentials", "true")
	token := r.Header.Get("Authorization")
	if db.CheckToken(token) == -1 {
		w.WriteHeader(401)
		return
	}
	body, err := io.ReadAll(r.Body)
	if err != nil {
		w.WriteHeader(400)
		return
	}
	var requester, _ = pool.Clients.Get(token)
	var permitted = false
	err = db.DatabaseConn.QueryRow(context.Background(), "select exists(select 1 from participants where user_id = $1 and channel_id = (select channel_id from messages where message_id = $2))", requester.ID, body).Scan(&permitted)
	if err != nil || !permitted {
		w.WriteHeader(401)
		return
	} else {
		var messageID uint64
		var channelID int
		var senderID int
		var senderName string
		var _type string
		var message string
		err = db.DatabaseConn.QueryRow(context.Background(), "select message_id, channel_id, sender_id, message, type from messages where message_id = $1", body).Scan(&messageID, &channelID, &senderID, &message, &_type)
		err = db.DatabaseConn.QueryRow(context.Background(), "select username from users where user_id = $1", senderID).Scan(&senderName)
		SendTo(&Message{
			ID:         messageID,
			ChannelID:  channelID,
			SenderName: senderName,
			SenderID:   senderID,
			ReplyTo:    0,
			Type:       _type,
			Content:    message,
		}, requester, false)
		w.WriteHeader(200)
	}
}
