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
	ChannelID  uint
	SenderID   uint
	SenderName string
	Type       string
	Content    string
	ReplyTo    *uint64
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
func JsonStruct(message Message, _isNew bool, _isLast bool) interface{} {
	if _isNew {
		return struct {
			IsNew      bool
			ID         uint64
			TimeStamp  string
			Type       string
			Text       string
			ReplyTo    *uint64
			SenderID   uint
			SenderName string
			Channel    uint
		}{
			ID:         message.ID,
			SenderID:   message.SenderID,
			SenderName: message.SenderName,
			Channel:    message.ChannelID,
			TimeStamp:  connections.Setting.StartTime.Add(sonyflake.ElapsedTime(message.ID)).Format("02/01/2006 15:04:05"),
			ReplyTo:    message.ReplyTo,
			Type:       message.Type,
			Text:       message.Content,
			IsNew:      true,
		}
	} else if _isLast {
		return struct {
			IsLast     bool
			ID         uint64
			TimeStamp  string
			Type       string
			Text       string
			ReplyTo    *uint64
			SenderID   uint
			SenderName string
			Channel    uint
		}{
			ID:         message.ID,
			SenderID:   message.SenderID,
			SenderName: message.SenderName,
			Channel:    message.ChannelID,
			TimeStamp:  connections.Setting.StartTime.Add(sonyflake.ElapsedTime(message.ID)).Format("02/01/2006 15:04:05"),
			ReplyTo:    message.ReplyTo,
			Type:       message.Type,
			Text:       message.Content,
			IsLast:     true,
		}
	} else {
		return struct {
			ID         uint64
			TimeStamp  string
			Type       string
			Text       string
			ReplyTo    *uint64
			SenderID   uint
			SenderName string
			Channel    uint
		}{
			ID:         message.ID,
			SenderID:   message.SenderID,
			SenderName: message.SenderName,
			Channel:    message.ChannelID,
			TimeStamp:  connections.Setting.StartTime.Add(sonyflake.ElapsedTime(message.ID)).Format("02/01/2006 15:04:05"),
			ReplyTo:    message.ReplyTo,
			Type:       message.Type,
			Text:       message.Content,
		}
	}
}
func ToJSON(message Message, _isNew bool, _isLast bool) []byte {
	jsonified, err := json.Marshal(JsonStruct(message, _isNew, _isLast))
	if err != nil {
		return nil
	}
	return Compress(jsonified)
}
