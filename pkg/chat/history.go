package chat

import (
	"github.com/sony/sonyflake"
)

type ChatHistory struct {
	ChatID   int
	Messages []Message
}

var IdGenerator *sonyflake.Sonyflake
var History ChatHistory
