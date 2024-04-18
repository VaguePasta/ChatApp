package chat

import (
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
	Type      string
	TimeStamp string
	Text      string
	Sender    int
	Channel   int
}

func ToJSON(message Message, isGet bool) []byte {
	var Type string
	if isGet {
		Type = "GetMessage"
	} else {
		Type = "NewMessage"
	}
	jsonified, _ := json.Marshal(SendMessage{
		Type:      Type,
		Sender:    message.SenderID,
		Channel:   message.ChannelID,
		TimeStamp: Setting.StartTime.Add(sonyflake.ElapsedTime(message.ID)).Format("02/01/2006 15:04:05"),
		Text:      message.Content,
	})
	return jsonified
}
