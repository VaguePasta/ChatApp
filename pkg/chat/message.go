package chat

import (
	"encoding/json"
)

type Message struct {
	ID          uint64
	MessageType int
	Content     string
}

func ToJSON(message Message) []byte {
	jsonified, _ := json.Marshal(message)
	return jsonified
}
