package chat

import (
	"bytes"
	"compress/gzip"
	"encoding/json"
	"github.com/sony/sonyflake"
)

type Message struct {
	ID        uint64
	ChannelID int
	SenderID  int
	Content   string
}
type SendMessage struct {
	Type      bool
	TimeStamp string
	Text      string
	Sender    int
	Channel   int
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
func ToJSON(message Message, isGet bool) []byte {
	jsonified, _ := json.Marshal(SendMessage{
		Type:      isGet,
		Sender:    message.SenderID,
		Channel:   message.ChannelID,
		TimeStamp: Setting.StartTime.Add(sonyflake.ElapsedTime(message.ID)).Format("02/01/2006 15:04:05"),
		Text:      message.Content,
	})
	return Compress(jsonified)
}
