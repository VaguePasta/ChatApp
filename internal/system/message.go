package system

import (
	"ChatApp/internal/connections"
	"bytes"
	"compress/gzip"
	"encoding/json"
	"github.com/sony/sonyflake"
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
		TimeStamp:  connections.Setting.StartTime.Add(sonyflake.ElapsedTime(message.ID)).Format("02/01/2006 15:04:05"),
		ReplyTo:    message.ReplyTo,
		Type:       message.Type,
		Text:       message.Content,
	})
	return Compress(jsonified)
}