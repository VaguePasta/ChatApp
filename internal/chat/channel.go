package chat

import (
	"github.com/sony/sonyflake"
)

type Channel struct {
	ChannelID int
	Messages  []Message
}

var Setting sonyflake.Settings
var IdGenerator *sonyflake.Sonyflake
