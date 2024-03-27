package chat

import (
	"encoding/json"
	"github.com/sony/sonyflake"
)

type Message struct {
	ID          uint64
	MessageType int
	Content     string
}
type SendMessage struct {
	TimeStamp string
	Content   string
}

func ToJSON(message Message) []byte {
	jsonified, _ := json.Marshal(SendMessage{
		TimeStamp: Setting.StartTime.Add(sonyflake.ElapsedTime(message.ID)).Format("02/01/2006 15:04:05"),
		Content:   message.Content,
	})
	return jsonified
}